import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch } from "../api";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js/auto";

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "#2563eb", bg = "#eff6ff", icon }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}
      >
        <span className="text-xl" aria-hidden>{icon}</span>
      </div>
      <div>
        <div className="font-display text-2xl font-bold" style={{ color }}>
          {value ?? <span className="inline-block w-12 h-6 rounded skeleton" />}
        </div>
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</div>
        {sub && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function RoleBadge({ isAdmin }) {
  return isAdmin ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M8 1a3 3 0 00-3 3v1H3.5A1.5 1.5 0 002 6.5v7A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0012.5 5H11V4a3 3 0 00-3-3zm2 4V4a2 2 0 10-4 0v1h4z" clipRule="evenodd" />
      </svg>
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM8 9a5 5 0 00-5 5h10a5 5 0 00-5-5z" />
      </svg>
      User
    </span>
  );
}

function UserTableSkeleton() {
  return (
    <div className="divide-y divide-slate-50 dark:divide-slate-800">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-28 rounded skeleton" />
            <div className="h-3 w-44 rounded skeleton" />
          </div>
          <div className="h-6 w-14 rounded-full skeleton hidden sm:block" />
          <div className="h-8 w-24 rounded-lg skeleton" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // Analytics state
  const [stats, setStats]           = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // User management state
  const [users, setUsers]               = useState([]);
  const [totalUsers, setTotalUsers]     = useState(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError]     = useState(null);
  const [roleUpdating, setRoleUpdating] = useState(null); // userId currently being updated

  // Chart refs
  const riskChartRef      = useRef(null);
  const timeChartRef      = useRef(null);
  const riskChartInstance = useRef(null);
  const timeChartInstance = useRef(null);

  // Current logged-in user id (for self-demotion guard)
  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")._id || null;
    } catch {
      return null;
    }
  })();

  // ── Fetch analytics ────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch("/api/admin/stats");
        if (active) setStats(data);
      } catch (err) {
        if (active) setStatsError(err.message || "Failed to load admin stats.");
      } finally {
        if (active) setStatsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // ── Fetch users ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(data.users || []);
      setTotalUsers(data.totalUsers ?? 0);
    } catch (err) {
      setUsersError(err.message || "Failed to load users.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Toggle user role ───────────────────────────────────────────────────
  const handleRoleToggle = async (userId, makeAdmin) => {
    setRoleUpdating(userId);
    try {
      const updated = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ isAdmin: makeAdmin }),
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isAdmin: updated.isAdmin } : u))
      );
    } catch (err) {
      setUsersError(err.message || "Failed to update role. Please try again.");
    } finally {
      setRoleUpdating(null);
    }
  };

  // ── Build charts ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!stats) return;

    const ctxRisk = riskChartRef.current?.getContext("2d");
    if (ctxRisk) {
      if (riskChartInstance.current) riskChartInstance.current.destroy();
      riskChartInstance.current = new Chart(ctxRisk, {
        type: "doughnut",
        data: {
          labels: ["Low Risk", "Moderate Risk", "High Risk"],
          datasets: [{
            data: [stats.lowRiskCount || 0, stats.mediumRiskCount || 0, stats.highRiskCount || 0],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderColor: ["#d1fae5", "#fef3c7", "#fee2e2"],
            borderWidth: 3,
            hoverOffset: 8,
          }],
        },
        options: {
          cutout: "68%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 16,
                font: { family: "DM Sans, sans-serif", size: 12 },
                color: "#475569",
                usePointStyle: true,
                pointStyleWidth: 10,
              },
            },
            tooltip: {
              backgroundColor: "#0f172a",
              titleFont: { family: "Sora, sans-serif", size: 12 },
              bodyFont:  { family: "DM Sans, sans-serif", size: 12 },
              padding: 10,
              cornerRadius: 8,
            },
          },
        },
      });
    }

    const ctxTime = timeChartRef.current?.getContext("2d");
    if (ctxTime) {
      if (timeChartInstance.current) timeChartInstance.current.destroy();
      const labels = (stats.predictionsOverTime || []).map((p) => p.date);
      const counts = (stats.predictionsOverTime || []).map((p) => p.count);
      timeChartInstance.current = new Chart(ctxTime, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Predictions",
            data: counts,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,0.06)",
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#2563eb",
            pointRadius: 4,
            pointHoverRadius: 6,
          }],
        },
        options: {
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#0f172a",
              titleFont: { family: "Sora, sans-serif", size: 12 },
              bodyFont:  { family: "DM Sans, sans-serif", size: 12 },
              padding: 10,
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(148,163,184,0.1)" },
              ticks: { font: { family: "DM Sans, sans-serif", size: 11 }, color: "#94a3b8" },
            },
            y: {
              beginAtZero: true,
              grid: { color: "rgba(148,163,184,0.1)" },
              ticks: { precision: 0, font: { family: "DM Sans, sans-serif", size: 11 }, color: "#94a3b8" },
            },
          },
        },
      });
    }

    return () => {
      if (riskChartInstance.current) riskChartInstance.current.destroy();
      if (timeChartInstance.current) timeChartInstance.current.destroy();
    };
  }, [stats]);

  const total = stats?.totalPredictions ?? null;
  const low   = stats?.lowRiskCount     ?? null;
  const med   = stats?.mediumRiskCount  ?? null;
  const high  = stats?.highRiskCount    ?? null;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white leading-tight">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Platform analytics &amp; user management</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ANALYTICS
      ══════════════════════════════════════════════ */}

      {statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-14 rounded skeleton" />
                  <div className="h-3 w-20 rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {statsError && (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#fef2f2" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-500">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">Failed to load analytics</p>
          <p className="text-xs text-slate-500">{statsError}</p>
        </div>
      )}

      {stats && !statsError && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
            <StatCard label="Total Predictions" value={total} icon="📊" color="#2563eb" bg="#eff6ff" />
            <StatCard label="Low Risk"   value={low}  icon="✅" color="#059669" bg="#f0fdf4"
              sub={total ? `${Math.round((low  / total) * 100)}% of total` : undefined} />
            <StatCard label="Moderate Risk" value={med}  icon="⚠️" color="#d97706" bg="#fffbeb"
              sub={total ? `${Math.round((med  / total) * 100)}% of total` : undefined} />
            <StatCard label="High Risk"  value={high} icon="🔴" color="#dc2626" bg="#fef2f2"
              sub={total ? `${Math.round((high / total) * 100)}% of total` : undefined} />
          </div>

          {/* Averages */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Avg. Age</p>
              <p className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                {stats.averageAge != null ? stats.averageAge.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-1">years · across all predictions</p>
            </div>
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Avg. Cholesterol</p>
              <p className="font-display text-3xl font-bold text-slate-900 dark:text-white">
                {stats.averageCholesterol != null ? stats.averageCholesterol.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-1">mg/dL · across all predictions</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm mb-5 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full inline-block" style={{ background: "linear-gradient(180deg,#10b981,#ef4444)" }} />
                Risk Distribution
              </h3>
              <canvas ref={riskChartRef} />
            </div>
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm mb-5 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full inline-block" style={{ background: "#2563eb" }} />
                Predictions Over Time
              </h3>
              <canvas ref={timeChartRef} />
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════
          USER MANAGEMENT
      ══════════════════════════════════════════════ */}
      <div className="card overflow-hidden">

        {/* Section header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500 dark:text-slate-400">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 dark:text-white text-sm leading-tight">
                User Management
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {totalUsers !== null
                  ? `${totalUsers} registered user${totalUsers !== 1 ? "s" : ""}`
                  : "Loading…"}
              </p>
            </div>
          </div>

          <button
            onClick={fetchUsers}
            disabled={usersLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--surface)",
              color: "var(--text-secondary)",
              borderColor: "var(--border-strong)",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className={`w-3 h-3 ${usersLoading ? "animate-spin" : ""}`}
            >
              <path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 01.908-.417A6 6 0 118 2v1z" clipRule="evenodd"/>
              <path d="M8 4.466V.534a.25.25 0 01.41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 018 4.466z"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Inline error banner */}
        {usersError && (
          <div className="px-6 py-3 flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-red-500 flex-shrink-0">
              <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm-.75-9.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs font-medium text-red-700 dark:text-red-400 flex-1">{usersError}</p>
            <button
              onClick={() => setUsersError(null)}
              className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              aria-label="Dismiss error"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {usersLoading && <UserTableSkeleton />}

        {/* User table */}
        {!usersLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[40%]">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[100px]">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 w-[130px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                {users.map((u) => {
                  const isSelf     = u._id === currentUserId;
                  const isUpdating = roleUpdating === u._id;
                  const initials   = u.name
                    ? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : "??";

                  return (
                    <tr
                      key={u._id}
                      className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors duration-150"
                    >
                      {/* Avatar + name */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 select-none"
                            style={{
                              background: u.isAdmin
                                ? "linear-gradient(135deg,#2563eb,#6366f1)"
                                : "linear-gradient(135deg,#64748b,#94a3b8)",
                            }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {u.name || "—"}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex-shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            {/* Email shown inline on mobile */}
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate sm:hidden mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email — desktop */}
                      <td className="px-6 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[220px] block">
                          {u.email}
                        </span>
                      </td>

                      {/* Role badge */}
                      <td className="px-6 py-3.5">
                        <RoleBadge isAdmin={u.isAdmin} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-3.5 text-right">
                        {u.isAdmin ? (
                          <button
                            onClick={() => handleRoleToggle(u._id, false)}
                            disabled={isUpdating || isSelf}
                            title={isSelf ? "Cannot remove your own admin privileges" : undefined}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                            style={{ color: "#dc2626", borderColor: "#fecaca" }}
                          >
                            {isUpdating ? (
                              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
                              </svg>
                            )}
                            Remove Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleToggle(u._id, true)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                            style={{ color: "#2563eb", borderColor: "#bfdbfe" }}
                          >
                            {isUpdating ? (
                              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                                <path d="M8 2a.75.75 0 01.75.75V7.5h4.75a.75.75 0 010 1.5H8.75v4.75a.75.75 0 01-1.5 0V9H2.5a.75.75 0 010-1.5H7.25V2.75A.75.75 0 018 2z"/>
                              </svg>
                            )}
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!usersLoading && !usersError && users.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-slate-50 dark:bg-slate-800">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-slate-400">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">No users found</p>
            <p className="text-xs text-slate-400">No registered accounts yet.</p>
          </div>
        )}

      </div>{/* end User Management card */}

    </div>
  );
}
