import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function DashboardPage() {
  const userJson =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let currentUser = null;
  try {
    currentUser = userJson ? JSON.parse(userJson) : null;
  } catch {
    currentUser = null;
  }

  const name = currentUser?.name || "there";
  const firstName = name.split(" ")[0];

  const [recentCount, setRecentCount] = useState(null);
  const [lastRisk, setLastRisk] = useState(null);

  useEffect(() => {
    apiFetch("/api/predictions/history")
      .then((data) => {
        const arr = data || [];
        setRecentCount(arr.length);
        if (arr.length > 0) setLastRisk(arr[0].riskLevel || null);
      })
      .catch(() => {
        setRecentCount(0);
      });
  }, []);

  const getRiskChip = (risk) => {
    if (!risk) return null;
    const r = risk.toLowerCase();
    if (r.includes("low"))
      return <span className="tag" style={{ background: "#d1fae5", color: "#065f46" }}>● {risk}</span>;
    if (r.includes("moderate") || r.includes("medium"))
      return <span className="tag" style={{ background: "#fef3c7", color: "#78350f" }}>● {risk}</span>;
    if (r.includes("high"))
      return <span className="tag" style={{ background: "#fee2e2", color: "#7f1d1d" }}>● {risk}</span>;
    return <span className="tag" style={{ background: "#f1f5f9", color: "#475569" }}>{risk}</span>;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
        }}
      >
        {/* deco blob */}
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />

        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">{greeting}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            {firstName} 👋
          </h1>
          <p className="text-blue-100/70 text-sm max-w-md">
            Use CardioAI to run a cardiovascular risk assessment. Results include risk level, contributing factors, and personalised health recommendations.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#eff6ff" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
            </svg>
          </div>
          <div>
            <div className="font-display text-xl font-bold text-slate-900">
              {recentCount === null ? (
                <span className="inline-block w-8 h-5 rounded skeleton" />
              ) : recentCount}
            </div>
            <div className="text-xs text-slate-500">Total predictions</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#f0fdf4" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-600">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 leading-tight">
              {lastRisk ? getRiskChip(lastRisk) : (
                <span className="text-slate-400 text-xs">No predictions yet</span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Last assessment result</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#fffbeb" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-600">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-slate-900">ML Model</div>
            <div className="text-xs text-slate-500">Scikit-learn · Active</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* New Prediction */}
        <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: "#eff6ff", color: "#2563eb" }}>Primary</span>
          </div>
          <h3 className="font-display font-semibold text-slate-900 mb-1.5">New Assessment</h3>
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            Run a new AI-powered cardiovascular risk prediction. Enter 8 clinical health parameters to get your risk level and personalized insights.
          </p>
          <Link
            to="/app/predict"
            className="btn-primary text-sm px-5 py-2.5 inline-flex"
            style={{ borderRadius: "10px" }}
          >
            Start Prediction →
          </Link>
        </div>

        {/* History */}
        <div className="card p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="font-display font-semibold text-slate-900 mb-1.5">Prediction History</h3>
          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            Review all your previous assessments. Track how your risk metrics change over time with detailed records of each prediction.
          </p>
          <Link
            to="/app/history"
            className="btn-secondary text-sm px-5 py-2.5 inline-flex"
            style={{ borderRadius: "10px" }}
          >
            View History
          </Link>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl p-5 flex items-start gap-4"
        style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#0ea5e9" }}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-sky-900 mb-0.5">Educational tool only</p>
          <p className="text-xs text-sky-700 leading-relaxed">
            This AI system provides cardiovascular risk estimates for research and educational purposes. Always consult a qualified healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
