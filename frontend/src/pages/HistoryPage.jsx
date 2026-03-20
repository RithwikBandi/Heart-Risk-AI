import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api";

function RiskBadge({ risk }) {
  if (!risk) return <span className="text-slate-400 text-xs">—</span>;
  const r = risk.toLowerCase();
  if (r.includes("low"))
    return (
      <span className="tag text-xs" style={{ background: "#d1fae5", color: "#065f46" }}>
        ● Low
      </span>
    );
  if (r.includes("moderate") || r.includes("medium"))
    return (
      <span className="tag text-xs" style={{ background: "#fef3c7", color: "#78350f" }}>
        ● Moderate
      </span>
    );
  if (r.includes("high"))
    return (
      <span className="tag text-xs" style={{ background: "#fee2e2", color: "#7f1d1d" }}>
        ● High
      </span>
    );
  return (
    <span className="tag text-xs" style={{ background: "#f1f5f9", color: "#475569" }}>
      {risk}
    </span>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch("/api/predictions/history");
        if (active) setItems(data || []);
      } catch (err) {
        if (!active) return;
        const message = err.message || "Failed to load history.";
        if (message.includes("401") || message.toLowerCase().includes("unauthorized")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        if (message.toLowerCase().includes("user not found")) {
          setItems([]);
          setError(null);
          return;
        }
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Prediction History</h1>
          <p className="text-slate-500 text-sm">
            All your previous cardiovascular risk assessments
          </p>
        </div>
        <Link to="/app/predict" className="btn-primary text-sm px-4 py-2.5" style={{ borderRadius: "10px" }}>
          + New Assessment
        </Link>
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {loading && (
          <div className="p-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-4 w-32 rounded-lg skeleton" />
                <div className="h-4 w-12 rounded-lg skeleton" />
                <div className="h-4 w-12 rounded-lg skeleton" />
                <div className="h-4 w-16 rounded-lg skeleton" />
                <div className="h-4 w-20 rounded-lg skeleton" />
                <div className="h-6 w-20 rounded-full skeleton" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "#fef2f2" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-500">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Failed to load history</p>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "#f1f5f9" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-display font-semibold text-slate-800 mb-2">No predictions yet</p>
            <p className="text-sm text-slate-500 mb-5">
              Run your first cardiovascular risk assessment to see results here.
            </p>
            <Link to="/app/predict" className="btn-primary text-sm px-5 py-2.5" style={{ borderRadius: "10px" }}>
              Run Assessment →
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            {/* Summary strip */}
            <div className="flex items-center gap-6 px-6 py-4 border-b border-slate-100"
              style={{ background: "#f8fafc" }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-500 font-medium">
                  {items.length} total assessment{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              {(() => {
                const low = items.filter(i => i.riskLevel?.toLowerCase().includes("low")).length;
                const mod = items.filter(i => i.riskLevel?.toLowerCase().includes("mod") || i.riskLevel?.toLowerCase().includes("medium")).length;
                const high = items.filter(i => i.riskLevel?.toLowerCase().includes("high")).length;
                return (
                  <>
                    {low > 0 && <span className="text-xs" style={{ color: "#065f46" }}>● {low} Low</span>}
                    {mod > 0 && <span className="text-xs" style={{ color: "#78350f" }}>● {mod} Moderate</span>}
                    {high > 0 && <span className="text-xs" style={{ color: "#7f1d1d" }}>● {high} High</span>}
                  </>
                );
              })()}
            </div>

            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Date & Time", "Age", "BMI", "BP (sys)", "Cholesterol", "Risk Level"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((p, idx) => (
                  <tr
                    key={p._id || idx}
                    className="border-t border-slate-50 transition-colors duration-150 hover:bg-blue-50/30"
                  >
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-xs">
                      {p.createdAt ? (
                        <div>
                          <div className="font-medium text-slate-800">
                            {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                          <div className="text-slate-400 mt-0.5">
                            {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">{p.age ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-700">{p.bmi ?? "—"}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {p.systolicBP ? <>{p.systolicBP} <span className="text-xs text-slate-400">mmHg</span></> : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {p.cholesterol ? <>{p.cholesterol} <span className="text-xs text-slate-400">mg/dL</span></> : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <RiskBadge risk={p.riskLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
