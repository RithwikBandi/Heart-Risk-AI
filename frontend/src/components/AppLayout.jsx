import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userJson =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  let currentUser = null;
  try { currentUser = userJson ? JSON.parse(userJson) : null; } catch { currentUser = null; }

  const isAdmin  = currentUser?.isAdmin;
  const userName = currentUser?.name || "User";
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // ✅ Correct logout — goes to /
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const navLinks = [
    {
      to: "/app", label: "Dashboard",
      icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    },
    {
      to: "/app/predict", label: "Predict",
      icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>,
    },
    {
      to: "/app/history", label: "History",
      icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
    },
  ];

  if (isAdmin) {
    navLinks.push({
      to: "/app/admin", label: "Admin",
      icon: <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
    });
  }

  const isDark = theme === "dark"; // kept only for ThemeToggle prop — not used for styles

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-200">

      {/* ── Sticky Nav ── */}
      <header
        className="sticky top-0 z-50 transition-all duration-300 bg-white/92 dark:bg-slate-900/92 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/50 shadow-sm dark:shadow-black/20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            className="flex items-center justify-between gap-4 transition-all duration-300"
            style={{ height: scrolled ? "52px" : "64px" }}
          >
            {/* Brand */}
            <Link to="/app" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div
                className="rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  width: scrolled ? "28px" : "32px",
                  height: scrolled ? "28px" : "32px",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="text-white" stroke="currentColor" strokeWidth="2"
                  style={{ width: scrolled ? "14px" : "16px", height: scrolled ? "14px" : "16px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <span
                className="font-display font-semibold tracking-tight transition-all duration-300 text-slate-900 dark:text-white"
                style={{ fontSize: scrolled ? "13px" : "14px" }}
              >
                CardioAI
              </span>
            </Link>

            {/* Nav links (desktop) */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map(({ to, label, icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${active
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    style={{ padding: scrolled ? "6px 12px" : "8px 14px" }}
                  >
                    <span className={active ? "opacity-100" : "opacity-60"}>{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right — theme toggle + profile + logout */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Theme toggle */}
              <ThemeToggle theme={theme} onToggle={toggleTheme} variant="light-bg" />

              {/* Profile — single clickable avatar */}
              <Link
                to="/app/profile"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200
                  ${location.pathname === "/app/profile"
                    ? "bg-blue-50 dark:bg-blue-900/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                title={`Profile — ${userName}`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform duration-200 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                >
                  {initials}
                </div>
                <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[90px] truncate">
                  {userName}
                </span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile nav strip */}
          <div className="flex md:hidden items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
            {navLinks.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${active
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <span className={active ? "opacity-100" : "opacity-60"}>{icon}</span>
                  {label}
                </Link>
              );
            })}
            {/* Mobile profile */}
            <Link
              to="/app/profile"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${location.pathname === "/app/profile"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-60">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6 mt-8 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            CardioAI · Final Year CS Project · For educational purposes only
          </p>
          <Link to="/case-study" className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View Case Study →
          </Link>
        </div>
      </footer>

      {/* Scroll-to-top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
          ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
