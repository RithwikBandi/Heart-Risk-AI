import { useEffect, useRef, useState } from "react";
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

function StatCard({ label, value, sub, color = "#2563eb", bg = "#eff6ff", icon }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}>
        <span className="text-xl" aria-hidden>{icon}</span>
      </div>
      <div>
        <div className="font-display text-2xl font-bold" style={{ color }}>
          {value ?? <span className="inline-block w-12 h-6 rounded skeleton" />}
        </div>
        <div className="text-xs font-semibold text-slate-600">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const riskChartRef = useRef(null);
  const timeChartRef = useRef(null);
  const riskChartInstance = useRef(null);
  const timeChartInstance = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch("/api/admin/stats");
        if (active) setStats(data);
      } catch (err) {
        if (active) setError(err.message || "Failed to load admin stats.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

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
              bodyFont: { family: "DM Sans, sans-serif", size: 12 },
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
              bodyFont: { family: "DM Sans, sans-serif", size: 12 },
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
  const low = stats?.lowRiskCount ?? null;
  const med = stats?.mediumRiskCount ?? null;
  const high = stats?.highRiskCount ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-xs">Platform analytics &amp; monitoring</p>
        </div>
      </div>

      {loading && (
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

      {error && (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "#fef2f2" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-500">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-800 text-sm mb-1">Failed to load admin data</p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      )}

      {stats && !error && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
            <StatCard label="Total Predictions" value={total} icon="📊" color="#2563eb" bg="#eff6ff" />
            <StatCard label="Low Risk" value={low} icon="✅" color="#059669" bg="#f0fdf4"
              sub={total ? `${Math.round((low / total) * 100)}% of total` : undefined} />
            <StatCard label="Moderate Risk" value={med} icon="⚠️" color="#d97706" bg="#fffbeb"
              sub={total ? `${Math.round((med / total) * 100)}% of total` : undefined} />
            <StatCard label="High Risk" value={high} icon="🔴" color="#dc2626" bg="#fef2f2"
              sub={total ? `${Math.round((high / total) * 100)}% of total` : undefined} />
          </div>

          {/* Avg stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Avg. Age</p>
              <p className="font-display text-3xl font-bold text-slate-900">
                {stats.averageAge != null ? stats.averageAge.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-1">years · across all predictions</p>
            </div>
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Avg. Cholesterol</p>
              <p className="font-display text-3xl font-bold text-slate-900">
                {stats.averageCholesterol != null ? stats.averageCholesterol.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-slate-400 mt-1">mg/dL · across all predictions</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-800 text-sm mb-5 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full inline-block" style={{ background: "linear-gradient(180deg, #10b981, #ef4444)" }} />
                Risk Distribution
              </h3>
              <canvas ref={riskChartRef} />
            </div>
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-800 text-sm mb-5 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full inline-block" style={{ background: "#2563eb" }} />
                Predictions Over Time
              </h3>
              <canvas ref={timeChartRef} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
