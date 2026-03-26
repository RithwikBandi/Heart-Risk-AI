import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const userJson =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let currentUser = null;
  try {
    currentUser = userJson ? JSON.parse(userJson) : null;
  } catch {
    currentUser = null;
  }

  const name = currentUser?.name || "User";
  const email = currentUser?.email || "—";
  const isAdmin = currentUser?.isAdmin || false;
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const navigate = useNavigate();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const INFO_ROWS = [
    { label: "Full Name",    value: name,   icon: "👤" },
    { label: "Email",        value: email,  icon: "✉️" },
    { label: "Account Type", value: isAdmin ? "Administrator" : "Standard User", icon: "🔑" },
  ];

  const TIPS = [
    { icon: "📋", text: "Use the Predict page to run a new cardiovascular risk assessment." },
    { icon: "📈", text: "Check History to track how your risk metrics change over time." },
    { icon: "📚", text: "Visit Resources to explore the research behind the predictive model." },
    { icon: "⚠️", text: "This tool is for educational purposes only — not a medical diagnosis." },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">My Profile</h1>
        <p className="text-slate-500 text-sm">Your account information and preferences.</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563eb, #6366f1)", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}
        >
          {initials}
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">{name}</h2>
          <p className="text-slate-500 text-sm">{email}</p>
          <span
            className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={
              isAdmin
                ? { background: "#fef3c7", color: "#78350f" }
                : { background: "#eff6ff", color: "#1d4ed8" }
            }
          >
            {isAdmin ? "⭐ Admin" : "👤 User"}
          </span>
        </div>
      </div>

      {/* Account info */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50"
          style={{ background: "#f8fafc" }}>
          <h3 className="font-display font-semibold text-slate-800 text-sm">Account Information</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {INFO_ROWS.map(({ label, value, icon }) => (
            <div key={label} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-sm text-slate-500">{label}</span>
              </div>
              <span className="text-sm font-medium text-slate-800 text-right truncate max-w-[200px]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips / usage guide */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">
          Getting the most from CardioML
        </h3>
        <div className="space-y-3">
          {TIPS.map(({ icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl text-sm text-slate-600"
              style={{ background: "#f8fafc" }}>
              <span className="flex-shrink-0 text-base">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-800 text-sm mb-1">Session</h3>
        <p className="text-slate-500 text-xs mb-5">
          Signing out will clear your local session. Your prediction history is saved in the database.
        </p>
        {!logoutConfirm ? (
          <button
            onClick={() => setLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50"
            style={{ border: "1.5px solid #fca5a5" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
            </svg>
            Sign out
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Are you sure?</span>
            <button onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: "#ef4444" }}>
              Yes, sign out
            </button>
            <button onClick={() => setLogoutConfirm(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
