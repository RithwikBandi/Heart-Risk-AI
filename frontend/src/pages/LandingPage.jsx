import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "ML-Powered Prediction",
    desc: "Logistic Regression trained on 5,500 clinical records. Delivers Low / Moderate / High risk classification with ~95% accuracy.",
    color: "blue",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "FastAPI Backend",
    desc: "High-performance Python API with JWT authentication, MongoDB storage, and real-time model inference.",
    color: "violet",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    title: "Explainable AI",
    desc: "SHAP-based explanations surface key risk drivers, protective elements, and personalised recommendations.",
    color: "emerald",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "Secure & Private",
    desc: "JWT-secured endpoints, bcrypt password hashing, isolated per-user prediction histories.",
    color: "amber",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Prediction History",
    desc: "Track risk assessments over time. Every prediction is stored and reviewable in your personal dashboard.",
    color: "rose",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
      </svg>
    ),
    title: "Admin Dashboard",
    desc: "Real-time analytics — prediction volume, risk distribution charts, and user activity monitoring.",
    color: "sky",
  },
];

const JOURNEY_STEPS = [
  {
    num: "01",
    phase: "Exploration",
    color: "#6366f1",
    bg: "#eef2ff",
    darkBg: "rgba(99,102,241,0.1)",
    icon: "🔍",
    headline: "Finding the right data",
    bullets: [
      "Evaluated multiple cardiovascular datasets",
      "Prioritised data completeness & clinical accuracy",
      "Selected: 5,500 patient records, 9 features",
    ],
    insight: "Data quality > data quantity.",
  },
  {
    num: "02",
    phase: "Validation",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    darkBg: "rgba(14,165,233,0.1)",
    icon: "✅",
    headline: "Cleaning before building",
    bullets: [
      "Removed patient_id — irrelevant identifier",
      "Removed risk_score — direct data leakage",
      "Checked distributions, outliers & correlations",
    ],
    insight: "Bad features break good models.",
  },
  {
    num: "03",
    phase: "Iteration",
    color: "#f59e0b",
    bg: "#fffbeb",
    darkBg: "rgba(245,158,11,0.1)",
    icon: "🔄",
    headline: "Many models, many runs",
    bullets: [
      "Tested: Logistic Regression, Random Forest",
      "Also: Gradient Boosting, XGBoost, ANN",
      "Ran full-feature and reduced-feature variants",
    ],
    insight: "Iteration exposed what mattered.",
  },
  {
    num: "04",
    phase: "Final Model",
    color: "#10b981",
    bg: "#f0fdf4",
    darkBg: "rgba(16,185,129,0.1)",
    icon: "🏆",
    headline: "Simple model wins",
    bullets: [
      "Full model accuracy: ~95.09%",
      "Reduced features: ~94.55% — near-identical",
      "Logistic Regression: accurate + interpretable",
    ],
    insight: "Simplicity + explainability = deployable.",
  },
];

const MODEL_COMPARISON = [
  { model: "Logistic Regression", accuracy: "95.09%", bar: 95, selected: true  },
  { model: "Random Forest",       accuracy: "~91%",   bar: 91, selected: false },
  { model: "Gradient Boosting",   accuracy: "~90%",   bar: 90, selected: false },
  { model: "XGBoost",             accuracy: "~89%",   bar: 89, selected: false },
  { model: "ANN",                 accuracy: "~88%",   bar: 88, selected: false },
];

const RESOURCES = [
  {
    icon: "🗃️",
    title: "Training Dataset",
    label: "Kaggle · 5,500 records",
    desc: "Curated cardiovascular dataset selected for quality and clinical relevance.",
    link: "https://www.kaggle.com/datasets/amirmahdiabbootalebi/heart-disease",
    color: "#2563eb",
  },
  {
    icon: "✅",
    title: "Data Validation",
    label: "Google Colab",
    desc: "Outlier detection, distribution checks, and feature correlation study.",
    link: "https://colab.research.google.com/drive/1MnZ6Q-MATm9FymyJcDxrPxAnfgfAms5g",
    color: "#059669",
  },
  {
    icon: "🔬",
    title: "Full Research Model",
    label: "Google Colab",
    desc: "All 5 algorithms compared using the complete feature set.",
    link: "https://colab.research.google.com/drive/1PYu2eG6fNJm5SMuag7_3SZu1m1TWk-Uf",
    color: "#7c3aed",
  },
  {
    icon: "🎯",
    title: "Site Feature Model",
    label: "Google Colab",
    desc: "Re-tested with only the 8 features used in the web application.",
    link: "https://colab.research.google.com/drive/1sDebUgeDYdjulMOru1E5dnuXFoeG9VRH",
    color: "#d97706",
  },
  {
    icon: "🚀",
    title: "Deployment Model",
    label: "Google Colab",
    desc: "Final model with SHAP explainability and .pkl export for production.",
    link: "https://colab.research.google.com/drive/1m_ZXY22QOtGOLBPUjvNbqyAiqg2s9FII",
    color: "#0ea5e9",
  },
  {
    icon: "💻",
    title: "GitHub Repository",
    label: "github.com/RithwikBandi/Heart-Risk-AI",
    desc: "Full project source code, notebooks, and development history.",
    link: "https://github.com/RithwikBandi/Heart-Risk-AI",
    color: "#6366f1",
  },
];

const STEPS = [
  { num: "01", title: "Enter health metrics",    desc: "Input age, BMI, blood pressure, cholesterol, smoking status, activity level, and stress score." },
  { num: "02", title: "AI analyzes your profile", desc: "The ML model processes your clinical data against learned cardiovascular patterns." },
  { num: "03", title: "Receive your assessment",  desc: "Get Low / Moderate / High risk with key drivers, protective factors, and recommendations." },
];

const colorMap = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-950/40",    text: "text-blue-600 dark:text-blue-400",    ring: "ring-blue-100 dark:ring-blue-900/50"    },
  violet:  { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-100 dark:ring-violet-900/50" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40",text:"text-emerald-600 dark:text-emerald-400",ring:"ring-emerald-100 dark:ring-emerald-900/50"},
  amber:   { bg: "bg-amber-50 dark:bg-amber-950/40",   text: "text-amber-600 dark:text-amber-400",   ring: "ring-amber-100 dark:ring-amber-900/50"   },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/40",     text: "text-rose-600 dark:text-rose-400",     ring: "ring-rose-100 dark:ring-rose-900/50"     },
  sky:     { bg: "bg-sky-50 dark:bg-sky-950/40",       text: "text-sky-600 dark:text-sky-400",       ring: "ring-sky-100 dark:ring-sky-900/50"       },
};

// ─── InView hook ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === "dark";
  const isLoggedIn = !!localStorage.getItem("token");
  const handleCTA = () => navigate(isLoggedIn ? "/app/predict" : "/register");
  const ctaLabel = isLoggedIn ? "Go to Prediction" : "Start Free Assessment";

  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [featRef,    featInView]    = useInView();
  const [journeyRef, journeyInView] = useInView();
  const [stepsRef,   stepsInView]   = useInView();
  const [resRef,     resInView]     = useInView();
  const [aboutRef,   aboutInView]   = useInView();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Page bg colour — matches CSS var(--bg-page) for both modes
  const pageBg = isDark ? "#0a0f1e" : "#f8fafc";

  return (
    <div
      className="min-h-screen font-sans transition-colors duration-300"
      style={{ backgroundColor: pageBg }}
    >

      {/* ── Navbar ────────────────────────────────────────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{ paddingTop: scrolled ? "6px" : "14px" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div
            className="flex items-center justify-between px-5 rounded-2xl transition-all duration-300"
            style={{
              height: scrolled ? "50px" : "58px",
              background: isDark
                ? scrolled ? "rgba(10,15,30,0.96)" : "rgba(10,15,30,0.88)"
                : scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.88)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: isDark
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(148,163,184,0.18)",
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.4)"
                : "0 4px 24px rgba(15,23,42,0.07)",
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <span
                className="font-display font-semibold text-sm tracking-tight transition-colors duration-300"
                style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
              >
                CardioAI
              </span>
            </div>

            {/* Links */}
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {["#features", "#journey", "#how-it-works", "#resources"].map((href, i) => (
                <a
                  key={href}
                  href={href}
                  className="transition-colors duration-200 hover:text-blue-500"
                  style={{ color: isDark ? "#8b9cc8" : "#475569" }}
                >
                  {["Features", "Research", "How it works", "Resources"][i]}
                </a>
              ))}
            </nav>

            {/* CTA row */}
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={toggleTheme} variant="light-bg" />
              <Link
                to="/login"
                className="hidden sm:block text-sm font-medium transition-colors duration-200"
                style={{ color: isDark ? "#8b9cc8" : "#475569" }}
              >
                Sign in
              </Link>
              <button
                onClick={handleCTA}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 3px 12px rgba(37,99,235,0.3)" }}
              >
                {isLoggedIn ? "Go to Prediction" : "Get Started"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-36 pb-0 px-4 sm:px-6"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)" }}
      >
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 animate-pulse-slow"
            style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-in"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#bfdbfe" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Heart-Risk-Prediction-AI · AI-Powered Healthcare
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-up"
            style={{ animationDelay: "100ms" }}>
            Predict Cardiovascular<br />
            <span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Risk With AI
            </span>
          </h1>

          <p className="text-blue-100/75 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
            style={{ animationDelay: "200ms" }}>
            Enter your clinical health data and receive an instant ML-powered cardiovascular risk assessment with explainable insights and personalised recommendations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "300ms" }}>
            <button
              onClick={handleCTA}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 6px 24px rgba(37,99,235,0.4)" }}
            >
              {ctaLabel}
            </button>
            <Link
              to="/case-study"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
            >
              View Case Study →
            </Link>
          </div>

          {/* Risk labels */}
          <div className="flex items-center justify-center gap-3 mt-12 mb-16 animate-fade-up" style={{ animationDelay: "400ms" }}>
            {[
              { label: "Low Risk",      color: "#10b981", bg: "rgba(16,185,129,0.12)" },
              { label: "Moderate Risk", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
              { label: "High Risk",     color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
            ].map(({ label, color, bg }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: bg, border: `1px solid ${color}30`, color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Wave divider — fill matches page bg in both modes ── */}
        <div className="absolute bottom-0 inset-x-0 leading-none" style={{ lineHeight: 0, fontSize: 0 }}>
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%", height: "80px" }}
            preserveAspectRatio="none"
          >
            <path
              d="M0 80L60 67C120 53 240 27 360 20C480 13 600 27 720 33C840 40 960 40 1080 33C1200 27 1320 13 1380 7L1440 0V80H0Z"
              fill={isDark ? "#0a0f1e" : "#f8fafc"}
            />
          </svg>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-16"
        style={{ marginTop: 0, paddingTop: "24px" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "5,500", label: "Training Records", sub: "patient dataset"          },
            { value: "~95%",  label: "Model Accuracy",   sub: "logistic regression"      },
            { value: "8",     label: "Clinical Inputs",  sub: "health parameters"        },
            { value: "5",     label: "Models Tested",    sub: "LR · RF · GB · XGB · ANN" },
          ].map(({ value, label, sub }) => (
            <div
              key={label}
              className="rounded-2xl p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md border"
              style={{
                background: isDark ? "#141c2e" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              }}
            >
              <div className="font-display text-2xl font-bold mb-0.5 transition-colors duration-300"
                style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}>{value}</div>
              <div className="text-xs font-semibold mb-0.5 transition-colors duration-300"
                style={{ color: isDark ? "#b8c8e8" : "#374151" }}>{label}</div>
              <div className="text-xs transition-colors duration-300"
                style={{ color: isDark ? "#4a5880" : "#94a3b8" }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 pb-24" ref={featRef}>
        <div className="text-center mb-12">
          <p className="section-label mb-3">Platform features</p>
          <h2
            className="font-display text-3xl sm:text-4xl font-bold mb-4 transition-colors duration-300"
            style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
          >
            Everything you need for<br />cardiovascular risk assessment
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, desc, color }, i) => {
            const c = colorMap[color];
            return (
              <div
                key={title}
                className="rounded-2xl p-6 shadow-sm group cursor-default transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02] border"
                style={{
                  background: isDark ? "#141c2e" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  opacity: featInView ? 1 : 0,
                  transform: featInView ? undefined : "translateY(20px)",
                  transition: `opacity 0.5s ease ${i * 70}ms, transform 0.5s ease ${i * 70}ms, box-shadow 0.2s ease`,
                }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.bg} ${c.text} ring-4 ${c.ring} transition-transform duration-200 group-hover:scale-110`}>
                  {icon}
                </div>
                <h3
                  className="font-display font-semibold text-base mb-2 transition-colors duration-300"
                  style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
                >{title}</h3>
                <p
                  className="text-sm leading-relaxed transition-colors duration-300"
                  style={{ color: isDark ? "#8b9cc8" : "#64748b" }}
                >{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Model Journey ─────────────────────────────────── */}
      <section
        id="journey"
        className="py-24 px-4 sm:px-6"
        style={{
          background: isDark
            ? "linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)"
            : "linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto" ref={journeyRef}>
          <div className="text-center mb-14">
            <p className="section-label mb-3">Research & Development</p>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold mb-4 transition-colors duration-300"
              style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
            >
              Model Building Journey
            </h2>
            <p
              className="text-base max-w-xl mx-auto transition-colors duration-300"
              style={{ color: isDark ? "#8b9cc8" : "#64748b" }}
            >
              The real decisions made — from choosing a dataset to selecting the final production model.
            </p>
          </div>

          {/* 4 journey cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {JOURNEY_STEPS.map(({ num, phase, color, bg, darkBg, icon, headline, bullets, insight }, i) => (
              <div
                key={num}
                className="rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group border"
                style={{
                  background: isDark ? "#141c2e" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  opacity: journeyInView ? 1 : 0,
                  transform: journeyInView ? undefined : "translateY(24px)",
                  transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms, box-shadow 0.2s ease`,
                }}
              >
                {/* Phase badge + emoji */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full transition-all duration-200 group-hover:scale-105"
                    style={{ background: isDark ? darkBg : bg, color }}
                  >
                    {phase}
                  </span>
                  <span className="text-2xl">{icon}</span>
                </div>
                {/* Ghost number */}
                <div className="font-display text-5xl font-black mb-2 leading-none" style={{ color, opacity: 0.12 }}>{num}</div>
                {/* Headline */}
                <h3
                  className="font-display font-bold text-sm mb-3 leading-tight transition-colors duration-300"
                  style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
                >{headline}</h3>
                {/* Bullets */}
                <ul className="space-y-1.5 mb-4">
                  {bullets.map((b, bi) => (
                    <li key={bi} className="flex gap-2 text-xs leading-relaxed" style={{ color: isDark ? "#8b9cc8" : "#64748b" }}>
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                      {b}
                    </li>
                  ))}
                </ul>
                {/* Insight */}
                <div className="pt-3 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
                  <p className="text-xs font-semibold italic" style={{ color }}>"{insight}"</p>
                </div>
              </div>
            ))}
          </div>

          {/* Breakthrough banner */}
          <div
            className="rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", boxShadow: "0 12px 40px rgba(37,99,235,0.25)" }}
          >
            <div className="absolute right-0 top-0 w-56 h-56 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%,-30%)" }} />
            <div className="relative grid sm:grid-cols-5 gap-6 items-center">
              <div className="sm:col-span-3">
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-2">Key Breakthrough</p>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-3">
                  Logistic Regression outperformed every complex model
                </h3>
                <p className="text-blue-100/70 text-sm leading-relaxed">
                  After exhaustive testing across 5 algorithms with both full and reduced feature sets,
                  the simplest model achieved the highest accuracy. This validated a core ML principle —
                  <strong className="text-white"> complexity doesn't guarantee performance.</strong>{" "}
                  Logistic Regression was selected for its accuracy, interpretability, and ease of deployment with SHAP explainability.
                </p>
              </div>
              <div className="sm:col-span-2 space-y-2">
                {MODEL_COMPARISON.map(({ model, accuracy, bar, selected }) => (
                  <div key={model} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0 flex items-center gap-1.5">
                      <span className="text-xs text-blue-100/80 truncate">{model.split(" ")[0]}</span>
                      {selected && <span className="text-[10px] font-bold px-1 rounded" style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}>✓</span>}
                    </div>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${bar}%`, background: selected ? "#10b981" : "rgba(255,255,255,0.25)" }} />
                    </div>
                    <span className="text-xs font-semibold w-12 text-right" style={{ color: selected ? "#6ee7b7" : "rgba(255,255,255,0.4)" }}>
                      {accuracy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Journey CTA */}
          <div className="text-center">
            <Link
              to="/case-study"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: isDark ? "#141c2e" : "#ffffff",
                color: "#2563eb",
                borderColor: isDark ? "rgba(37,99,235,0.3)" : "#bfdbfe",
                boxShadow: "0 4px 16px rgba(37,99,235,0.08)",
              }}
            >
              View Full Case Study →
            </Link>
            <p className="text-xs mt-3 transition-colors duration-300" style={{ color: isDark ? "#4a5880" : "#94a3b8" }}>
              Metrics, model comparison, and research breakdown
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 py-24" ref={stepsRef}>
        <div className="text-center mb-14">
          <p className="section-label mb-3">How it works</p>
          <h2
            className="font-display text-3xl sm:text-4xl font-bold mb-4 transition-colors duration-300"
            style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
          >
            From data to diagnosis<br />in three steps
          </h2>
        </div>

        <div className="relative">
          <div
            className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 w-[calc(100%-120px)] h-px"
            style={{ background: isDark
              ? "linear-gradient(90deg, transparent, rgba(59,130,246,0.3) 20%, rgba(59,130,246,0.3) 80%, transparent)"
              : "linear-gradient(90deg, transparent, #bfdbfe 20%, #bfdbfe 80%, transparent)"
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc }, i) => (
              <div
                key={num}
                className="flex flex-col items-center text-center group"
                style={{
                  opacity: stepsInView ? 1 : 0,
                  transform: stepsInView ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms`,
                }}
              >
                <div
                  className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center mb-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 4px 20px rgba(37,99,235,0.3)" }}
                >
                  <span className="font-display text-xs font-bold text-blue-200 tracking-widest">{num}</span>
                  <span className="text-xl mt-0.5">{i === 0 ? "📋" : i === 1 ? "🧠" : "✅"}</span>
                </div>
                <h3
                  className="font-display font-semibold text-base mb-2 transition-colors duration-300"
                  style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
                >{title}</h3>
                <p
                  className="text-sm leading-relaxed transition-colors duration-300"
                  style={{ color: isDark ? "#8b9cc8" : "#64748b" }}
                >{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={handleCTA}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 4px 20px rgba(37,99,235,0.35)" }}
          >
            {ctaLabel} →
          </button>
        </div>
      </section>

      {/* ── Resources ─────────────────────────────────────── */}
      <section
        id="resources"
        className="py-24 px-4 sm:px-6"
        style={{
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
        }}
        ref={resRef}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Open Research</p>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold mb-4 transition-colors duration-300"
              style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
            >
              Project Resources
            </h2>
            <p
              className="text-base max-w-md mx-auto transition-colors duration-300"
              style={{ color: isDark ? "#8b9cc8" : "#64748b" }}
            >
              Every dataset, notebook, and model used to build CardioAI — fully open for review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RESOURCES.map(({ icon, title, label, desc, link, color }, i) => (
              <a
                key={title}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl p-6 shadow-sm group flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02] border"
                style={{
                  background: isDark ? "#141c2e" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                  opacity: resInView ? 1 : 0,
                  transform: resInView ? undefined : "translateY(20px)",
                  transition: `opacity 0.5s ease ${i * 70}ms, transform 0.5s ease ${i * 70}ms, box-shadow 0.2s ease`,
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${color}18` }}
                  >
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-display font-semibold text-sm transition-colors duration-300"
                      style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
                    >{title}</h4>
                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color }}>{label}</p>
                  </div>
                </div>
                <p
                  className="text-xs leading-relaxed flex-1 mb-4 transition-colors duration-300"
                  style={{ color: isDark ? "#8b9cc8" : "#64748b" }}
                >{desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold transition-colors duration-200" style={{ color }}>
                  Open link
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5">
                    <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 010-1.06L9.44 5.5H5.75a.75.75 0 010-1.5h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.56l-5.22 5.22a.75.75 0 01-1.06 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 pb-24" ref={aboutRef}>
        <div
          className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", boxShadow: "0 20px 60px rgba(15,23,42,0.2)" }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #60a5fa, transparent)", transform: "translate(30%,-30%)" }} />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div style={{
              opacity: aboutInView ? 1 : 0,
              transform: aboutInView ? "translateX(0)" : "translateX(-20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">About</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                Heart Risk Prediction AI by<br />
                <span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Rithwik (Ricky)
                </span>
              </h2>
              <p className="text-blue-100/70 text-sm leading-relaxed mb-4">
                An end-to-end AI-powered cardiovascular risk prediction system — combining a trained ML model, FastAPI REST backend, MongoDB database, and React frontend into a complete clinical decision-support application.
              </p>
              <a
                href="https://github.com/RithwikBandi/Heart-Risk-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                View on GitHub
              </a>
            </div>
            <div
              className="grid grid-cols-2 gap-3"
              style={{
                opacity: aboutInView ? 1 : 0,
                transform: aboutInView ? "translateX(0)" : "translateX(20px)",
                transition: "opacity 0.6s ease 200ms, transform 0.6s ease 200ms",
              }}
            >
              {[
                { tech: "React + Vite", role: "Frontend"       },
                { tech: "FastAPI",      role: "Backend API"    },
                { tech: "Scikit-learn", role: "ML Model"       },
                { tech: "MongoDB",      role: "Database"       },
                { tech: "JWT Auth",     role: "Security"       },
                { tech: "SHAP",         role: "Explainability" },
              ].map(({ tech, role }) => (
                <div
                  key={tech}
                  className="rounded-xl p-3.5 transition-all duration-200 hover:scale-[1.03]"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="text-white text-sm font-semibold">{tech}</div>
                  <div className="text-blue-300/60 text-xs mt-0.5">{role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
          background: isDark ? "#0a0f1e" : "#ffffff",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <span
              className="font-display text-sm font-semibold transition-colors duration-300"
              style={{ color: isDark ? "#f0f4ff" : "#0f172a" }}
            >
              CardioAI
            </span>
          </div>
          <p
            className="text-xs text-center transition-colors duration-300"
            style={{ color: isDark ? "#4a5880" : "#94a3b8" }}
          >
            © 2025 Heart Risk Prediction AI · Final Year Project · Built by Rithwik (Ricky)
          </p>
          <div className="flex items-center gap-5 text-xs transition-colors duration-300" style={{ color: isDark ? "#4a5880" : "#94a3b8" }}>
            <Link to="/case-study" className="hover:text-blue-500 transition-colors">Case Study</Link>
            <Link to="/login"      className="hover:text-blue-500 transition-colors">Sign in</Link>
            <Link to="/register"   className="hover:text-blue-500 transition-colors">Register</Link>
          </div>
        </div>
      </footer>

      {/* ── Scroll to top ─────────────────────────────────── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
}
