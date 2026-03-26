import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";

// ─── All data sourced from context.md / deep-research-report.md ──────────────

const FULL_FEATURE_RESULTS = [
  { model: "Logistic Regression", acc: 95.09, prec: 95.11, rec: 95.09, f1: 95.10, selected: true },
  { model: "Artificial Neural Network", acc: 94.27, prec: 94.37, rec: 94.27, f1: 94.27, selected: false },
  { model: "XGBoost", acc: 92.55, prec: 92.58, rec: 92.55, f1: 92.56, selected: false },
  { model: "Gradient Boosting", acc: 91.45, prec: 91.51, rec: 91.45, f1: 91.47, selected: false },
  { model: "Random Forest", acc: 90.18, prec: 90.38, rec: 90.18, f1: 90.22, selected: false },
];

const SITE_FEATURE_RESULTS = [
  { model: "Logistic Regression", acc: 94.55, prec: 94.54, rec: 94.55, f1: 94.54, selected: true },
  { model: "Artificial Neural Network", acc: 94.27, prec: 94.29, rec: 94.27, f1: 94.28, selected: false },
  { model: "Gradient Boosting", acc: 93.27, prec: 93.33, rec: 93.27, f1: 93.29, selected: false },
  { model: "XGBoost", acc: 92.27, prec: 92.31, rec: 92.27, f1: 92.28, selected: false },
  { model: "Random Forest", acc: 91.54, prec: 91.60, rec: 91.54, f1: 91.56, selected: false },
];

const ALL_ORIGINAL_FEATURES = [
  "patient_id", "age", "bmi", "systolic_bp", "diastolic_bp",
  "cholesterol_mg_dl", "resting_heart_rate", "smoking_status",
  "daily_steps", "stress_level", "physical_activity_hours_per_week",
  "sleep_hours", "family_history_heart_disease", "diet_quality_score",
  "alcohol_units_per_week", "heart_disease_risk_score",
];

const REMOVED_FEATURES = ["patient_id", "heart_disease_risk_score"];

const FINAL_FEATURES = [
  { name: "age", group: "Clinical", icon: "👤" },
  { name: "bmi", group: "Clinical", icon: "⚖️" },
  { name: "systolic_bp", group: "Clinical", icon: "🩺" },
  { name: "cholesterol_mg_dl", group: "Clinical", icon: "🧬" },
  { name: "smoking_status", group: "Lifestyle", icon: "🚬" },
  { name: "physical_activity_hours_per_week", group: "Lifestyle", icon: "🏃" },
  { name: "stress_level", group: "Lifestyle", icon: "🧠" },
  { name: "family_history_heart_disease", group: "Genetics", icon: "🧬" },
];

const STRONG_CORRELATIONS = [
  { feature: "Blood Pressure", direction: "positive", strength: "Very Strong", color: "#ef4444" },
  { feature: "Cholesterol", direction: "positive", strength: "Strong", color: "#f97316" },
  { feature: "Age", direction: "positive", strength: "Strong", color: "#f59e0b" },
  { feature: "BMI", direction: "positive", strength: "Moderate", color: "#eab308" },
  { feature: "Smoking Status", direction: "positive", strength: "Moderate", color: "#f97316" },
  { feature: "Stress Level", direction: "positive", strength: "Moderate", color: "#ef4444" },
  { feature: "Physical Activity", direction: "negative", strength: "Moderate", color: "#10b981" },
  { feature: "Daily Steps", direction: "negative", strength: "Moderate", color: "#10b981" },
];

const CLASS_DIST = [
  { label: "Low Risk", pct: 33.4, color: "#10b981" },
  { label: "Medium Risk", pct: 40.8, color: "#f59e0b" },
  { label: "High Risk", pct: 25.7, color: "#ef4444" },
];

const STACK = [
  { name: "React + Vite", role: "Frontend UI", icon: "⚛️", color: "#06b6d4" },
  { name: "FastAPI", role: "REST API Backend", icon: "⚡", color: "#059669" },
  { name: "MongoDB", role: "Database", icon: "🍃", color: "#16a34a" },
  { name: "Scikit-learn", role: "ML Framework", icon: "🤖", color: "#f97316" },
  { name: "SHAP + LIME", role: "Explainability", icon: "🔍", color: "#8b5cf6" },
  { name: "Logistic Reg.", role: "Final Model (.pkl)", icon: "🏆", color: "#2563eb" },
];

const RESOURCES = [
  { icon: "🗃️", label: "Training Dataset", sub: "Kaggle", link: "https://www.kaggle.com/datasets/amirmahdiabbootalebi/heart-disease" },
  { icon: "✅", label: "Data Validation", sub: "Google Colab", link: "https://colab.research.google.com/drive/1MnZ6Q-MATm9FymyJcDxrPxAnfgfAms5g" },
  { icon: "🔬", label: "Full Feature Research", sub: "Google Colab", link: "https://colab.research.google.com/drive/1PYu2eG6fNJm5SMuag7_3SZu1m1TWk-Uf" },
  { icon: "🎯", label: "Site Feature Research", sub: "Google Colab", link: "https://colab.research.google.com/drive/1sDebUgeDYdjulMOru1E5dnuXFoeG9VRH" },
  { icon: "🚀", label: "Deployment Notebook", sub: "Google Colab", link: "https://colab.research.google.com/drive/1m_ZXY22QOtGOLBPUjvNbqyAiqg2s9FII" },
  { icon: "💻", label: "GitHub", sub: "Source Code", link: "https://github.com/RithwikBandi" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
      {children}
    </p>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
      {children}
    </h2>
  );
}

// MetricPill — no isDark needed, uses Tailwind dark: classes
function MetricPill({ label, value, highlight }) {
  return (
    <div
      className={`flex flex-col items-center px-3 py-2.5 rounded-xl text-center transition-all duration-200 hover:scale-105 ${highlight
        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-800"
        : "bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
        }`}
    >
      <span className={`text-lg font-display font-bold ${highlight ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}>
        {value}%
      </span>
      <span className={`text-[10px] font-medium mt-0.5 ${highlight ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
        {label}
      </span>
    </div>
  );
}

// ModelRow — no isDark, uses Tailwind dark: classes
function ModelRow({ model, acc, prec, rec, f1, selected, delay, inView }) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 border group hover:-translate-y-0.5 hover:shadow-md ${selected
        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        }`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      {/* Winner badge */}
      <div className="flex-shrink-0 w-8 text-center">
        {selected
          ? <span className="text-sm font-bold text-emerald-500">✓</span>
          : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
        }
      </div>

      {/* Model name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{model}</span>
        {selected && (
          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
            Selected
          </span>
        )}
      </div>

      {/* Accuracy bar */}
      <div className="hidden sm:flex items-center gap-2 w-40">
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full rounded-full"
            style={{
              width: inView ? `${acc}%` : "0%",
              background: selected ? "linear-gradient(90deg,#2563eb,#10b981)" : "#cbd5e1",
              transition: `width 1s ease ${delay + 200}ms`,
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        {[["Acc", acc], ["Prec", prec], ["Rec", rec], ["F1", f1]].map(([lbl, val]) => (
          <MetricPill key={lbl} label={lbl} value={val.toFixed(2)} highlight={selected} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CaseStudyPage() {
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();
  const isLoggedIn = !!localStorage.getItem("token");

  // Auth-aware CTA
  const handleCTA = () => navigate(isLoggedIn ? "/app/predict" : "/register");
  const ctaLabel = isLoggedIn ? "Go to Prediction" : "Try the App";

  // Dynamic logo — logged in → /app, else → /
  const handleLogo = () => navigate(isLoggedIn ? "/app" : "/");

  const [showScrollTop, setShowScrollTop] = useState(false);

  const [heroRef, heroInView] = useInView(0.05);
  const [probRef, probInView] = useInView();
  const [dataRef, dataInView] = useInView();
  const [featRef, featInView] = useInView();
  const [phase1Ref, phase1InView] = useInView();
  const [phase2Ref, phase2InView] = useInView();
  const [compRef, compInView] = useInView();
  const [breakRef, breakInView] = useInView();
  const [decRef, decInView] = useInView();
  const [xaiRef, xaiInView] = useInView();
  const [stackRef, stackInView] = useInView();
  const [conclRef, conclInView] = useInView();
  const [resRef, resInView] = useInView();

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const TOC = [
    { id: "problem", label: "Problem" },
    { id: "dataset", label: "Dataset" },
    { id: "features", label: "Features" },
    { id: "phase1", label: "Phase 1 — Full" },
    { id: "phase2", label: "Phase 2 — Site" },
    { id: "comparison", label: "Comparison" },
    { id: "insight", label: "Breakthrough" },
    { id: "decision", label: "Final Decision" },
    { id: "xai", label: "Explainability" },
    { id: "stack", label: "System Design" },
    { id: "conclusion", label: "Conclusion" },
  ];

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-200">

      {/* ── Top Nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo — dynamic navigation */}
          <button
            type="button"
            onClick={handleLogo}
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <span className="font-display font-semibold text-slate-900 dark:text-white text-sm">CardioML</span>
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <button
              type="button"
              onClick={handleLogo}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Case Study</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} variant="light-bg" />
            {/* Back — navigate(-1) to preserve history */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors px-2 py-1"
            >
              ← Back
            </button>
            <button
              onClick={handleCTA}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-8 py-10">

        {/* ── Sidebar TOC (desktop) ─────────────────────── */}
        <aside className="hidden xl:block w-48 flex-shrink-0">
          <div className="sticky top-24 space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-3">
              Contents
            </p>
            {TOC.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="block px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
              >
                {label}
              </a>
            ))}
          </div>
        </aside>

        {/* ── Main content ────────────────────────────── */}
        <main className="flex-1 min-w-0 space-y-20">

          {/* ①  HERO ─────────────────────────────────── */}
          <section
            ref={heroRef}
            className="rounded-3xl p-8 sm:p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg,#0f172a 0%,#1e3a8a 55%,#1d4ed8 100%)",
              opacity: heroInView ? 1 : 0,
              transform: heroInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g)" />
            </svg>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle,#60a5fa,transparent)" }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#bfdbfe" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Final Year Project · Machine Learning · Healthcare
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight max-w-3xl">
                Building an ML-Powered<br />Cardiovascular Risk Prediction System
              </h1>
              <p className="text-blue-100/75 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
                From raw clinical data to a production-ready machine learning system — dataset validation, iterative model experimentation, and model explainability integration.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#phase1"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                  Read the Research ↓
                </a>
                <button
                  onClick={handleCTA}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}>
                  {ctaLabel}
                </button>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10">
                {[
                  { val: "5,500", lbl: "Patient Records" },
                  { val: "5", lbl: "Models Tested" },
                  { val: "~95%", lbl: "Best Accuracy" },
                  { val: "2", lbl: "Research Phases" },
                ].map(({ val, lbl }) => (
                  <div key={lbl}>
                    <div className="font-display text-xl font-bold text-white">{val}</div>
                    <div className="text-blue-200/60 text-xs mt-0.5">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ②  PROBLEM ──────────────────────────────── */}
          <section id="problem" ref={probRef}
            style={{
              opacity: probInView ? 1 : 0,
              transform: probInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Problem & Objective</SectionLabel>
            <SectionTitle>Why cardiovascular risk prediction matters</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "❤️", title: "The Problem",
                  desc: "Cardiovascular disease is a leading cause of death worldwide. Early, data-driven risk identification can enable preventive action before severe complications occur.",
                  accent: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/40",
                },
                {
                  icon: "🎯", title: "The Objective",
                  desc: "Build a clinically meaningful, interpretable ML system that takes 8 patient inputs and outputs a reliable Low / Moderate / High risk classification in real time.",
                  accent: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40",
                },
              ].map(({ icon, title, desc, accent }) => (
                <div key={title} className={`${accent} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                  <div className="text-2xl mb-4">{icon}</div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm mb-2">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ③  DATASET ──────────────────────────────── */}
          <section id="dataset" ref={dataRef}
            style={{
              opacity: dataInView ? 1 : 0,
              transform: dataInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Dataset & Validation</SectionLabel>
            <SectionTitle>Clean data is the foundation</SectionTitle>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { val: "5,500", lbl: "Patient Records" },
                { val: "16", lbl: "Original Features" },
                { val: "0", lbl: "Missing Values" },
                { val: "0", lbl: "Duplicates Found" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                  <div className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{val}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{lbl}</div>
                </div>
              ))}
            </div>

            {/* Class distribution */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-4">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">
                Class Distribution — Balanced dataset
              </h3>
              <div className="space-y-3">
                {CLASS_DIST.map(({ label, pct, color }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-28 flex-shrink-0 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    </div>
                    <div className="flex-1 h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 1s ease" }} />
                    </div>
                    <span className="w-12 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">{pct}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                A balanced class distribution is beneficial — many ML models assume roughly balanced classes, reducing bias toward any single category.
              </p>
            </div>

            {/* Leakage alert */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg bg-red-100 dark:bg-red-900/40">⚠️</div>
              <div>
                <p className="font-display font-bold text-red-800 dark:text-red-300 text-sm mb-1">Data Leakage Detected & Removed</p>
                <p className="text-red-700 dark:text-red-400 text-xs leading-relaxed">
                  <strong>heart_disease_risk_score</strong> showed extremely high correlation with the target variable <strong>risk_category</strong>. This is because risk_category is derived from this score — including it would allow the model to indirectly access the answer, inflating performance and producing a model that only works on training data.
                </p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-2 font-semibold">
                  Action: Removed before training. Model learns from genuine clinical features only.
                </p>
              </div>
            </div>
          </section>

          {/* ④  FEATURES ─────────────────────────────── */}
          <section id="features" ref={featRef}
            style={{
              opacity: featInView ? 1 : 0,
              transform: featInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Feature Engineering</SectionLabel>
            <SectionTitle>From 16 features to 14 validated inputs</SectionTitle>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Original (16)</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_ORIGINAL_FEATURES.map(f => {
                    const removed = REMOVED_FEATURES.includes(f);
                    return (
                      <span key={f}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${removed
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 line-through"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}>
                        {f}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/40 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 dark:text-red-500 mb-3">Removed (2)</p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">patient_id</span>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Non-informative identifier — carries no predictive value</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">heart_disease_risk_score</span>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Direct data leakage — target is derived from this feature</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400 mb-3">Final (14 full · 8 site)</p>
                <div className="flex flex-wrap gap-1.5">
                  {FINAL_FEATURES.map(({ name, icon }) => (
                    <span key={name} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      {icon} {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key correlations */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Feature Correlations with Risk</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {STRONG_CORRELATIONS.map(({ feature, direction, strength, color }) => (
                  <div key={feature} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color }}>
                        {direction === "positive" ? "↑ Risk" : "↓ Risk"}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{strength}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                Lifestyle features (physical activity, daily steps) show <em>negative</em> correlation — higher activity = lower risk.
              </p>
            </div>
          </section>

          {/* ⑤  PHASE 1 ──────────────────────────────── */}
          <section id="phase1" ref={phase1Ref}>
            <SectionLabel>Research Phase 1 — Full Features</SectionLabel>
            <SectionTitle>Evaluating maximum predictive capability</SectionTitle>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-2xl">
              All 5 models trained using the complete 14-feature set to establish the upper bound of predictive performance.
            </p>

            <div className="hidden sm:flex items-center gap-3 px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <div className="w-8" />
              <div className="flex-1">Model</div>
              <div className="w-40">Accuracy bar</div>
              <div className="grid grid-cols-4 gap-2 flex-shrink-0">
                {["Acc", "Prec", "Rec", "F1"].map(h => (
                  <div key={h} className="w-14 text-center">{h}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {FULL_FEATURE_RESULTS.map((row, i) => (
                <ModelRow key={row.model} {...row} delay={i * 80} inView={phase1InView} />
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300">
              <strong>Key Observation:</strong> Logistic Regression (95.09%) outperformed every model including ANN (94.27%) and XGBoost (92.55%). This suggests the relationships between features and risk are largely <em>linear</em> — complexity doesn't guarantee performance.
            </div>
          </section>

          {/* ⑥  PHASE 2 ──────────────────────────────── */}
          <section id="phase2" ref={phase2Ref}
            style={{
              opacity: phase2InView ? 1 : 0,
              transform: phase2InView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Research Phase 2 — Site Features</SectionLabel>
            <SectionTitle>Simulating real-world user input</SectionTitle>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-2xl">
              Retrained all models using only the 8 features available from the web app's input form.
            </p>

            <div className="hidden sm:flex items-center gap-3 px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <div className="w-8" />
              <div className="flex-1">Model</div>
              <div className="w-40">Accuracy bar</div>
              <div className="grid grid-cols-4 gap-2 flex-shrink-0">
                {["Acc", "Prec", "Rec", "F1"].map(h => (
                  <div key={h} className="w-14 text-center">{h}</div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {SITE_FEATURE_RESULTS.map((row, i) => (
                <ModelRow key={row.model} {...row} delay={i * 80} inView={phase2InView} />
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300">
              <strong>Key Finding:</strong> Logistic Regression again achieves the highest accuracy (94.55%) with fewer inputs — confirming it as the deployment model. ANN was close at 94.27% but lacked interpretability.
            </div>
          </section>

          {/* ⑦  VISUAL COMPARISON ───────────────────── */}
          <section id="comparison" ref={compRef}
            style={{
              opacity: compInView ? 1 : 0,
              transform: compInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Model Comparison</SectionLabel>
            <SectionTitle>Head-to-head across both phases</SectionTitle>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(90deg,#2563eb,#10b981)" }} />Full features
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-400" />Site features
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />Selected for deployment
                </span>
              </div>

              <div className="space-y-5">
                {FULL_FEATURE_RESULTS.map((full, i) => {
                  const site = SITE_FEATURE_RESULTS[i];
                  return (
                    <div key={full.model}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${full.selected
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50"
                        : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700"
                        }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm">{full.model}</span>
                          {full.selected && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                              ✓ Deployed
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold" style={{ color: full.selected ? "#2563eb" : "#94a3b8" }}>{full.acc}%</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">/ {site.acc}%</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 w-10 flex-shrink-0">Full</span>
                          <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                            <div className="h-full rounded-full" style={{ width: compInView ? `${full.acc}%` : "0%", background: full.selected ? "linear-gradient(90deg,#2563eb,#6366f1)" : "#94a3b8", transition: `width 1s ease ${i * 80}ms` }} />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-12 text-right">{full.acc}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 w-10 flex-shrink-0">Site</span>
                          <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                            <div className="h-full rounded-full" style={{ width: compInView ? `${site.acc}%` : "0%", background: full.selected ? "#10b981" : "#cbd5e1", transition: `width 1s ease ${i * 80 + 300}ms` }} />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-12 text-right">{site.acc}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ⑧  BREAKTHROUGH ─────────────────────────── */}
          <section id="insight" ref={breakRef}>
            <div
              className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
                boxShadow: "0 16px 48px rgba(37,99,235,0.25)",
                opacity: breakInView ? 1 : 0,
                transform: breakInView ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle,white,transparent)" }} />
              <div className="relative">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#bfdbfe" }}>
                  💡 Breakthrough Insight
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                  Less input, same power
                </h2>
                <p className="text-blue-100/80 text-base mb-8 max-w-xl leading-relaxed">
                  A carefully chosen 8-feature subset achieved <strong className="text-white">94.55%</strong> accuracy — nearly identical to the full 14-feature model at <strong className="text-white">95.09%</strong>. The difference is just <strong className="text-white">0.54%</strong>.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { val: "95.09%", lbl: "Full Model (14 features)", highlight: false },
                    { val: "94.55%", lbl: "Site Model (8 features)", highlight: true },
                    { val: "0.54%", lbl: "Accuracy drop", highlight: false },
                  ].map(({ val, lbl, highlight }) => (
                    <div key={lbl} className="rounded-xl p-4 text-center"
                      style={{ background: highlight ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <div className="font-display text-2xl font-bold text-white">{val}</div>
                      <div className="text-blue-200/60 text-xs mt-1">{lbl}</div>
                    </div>
                  ))}
                </div>
                <blockquote className="text-blue-100/70 text-sm italic border-l-2 border-blue-300/40 pl-4">
                  "This demonstrates efficient feature selection, reduced input complexity, and improved usability without meaningful performance loss."
                </blockquote>
              </div>
            </div>
          </section>

          {/* ⑨  FINAL DECISION ───────────────────────── */}
          <section id="decision" ref={decRef}
            style={{
              opacity: decInView ? 1 : 0,
              transform: decInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Final Model Selection</SectionLabel>
            <SectionTitle>Why Logistic Regression — and why not ANN or XGBoost</SectionTitle>

            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              {/* Why LR */}
              <div className="bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✅</span>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Why Logistic Regression</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    { label: "Highest Accuracy", desc: "94.55% on site features — best across both research phases" },
                    { label: "Interpretability", desc: "Coefficient-based — each feature's contribution is clear and explainable" },
                    { label: "Deployment Simplicity", desc: "Lightweight, fast inference, minimal computational overhead" },
                    { label: "XAI Compatible", desc: "Seamlessly integrates with SHAP and LIME for transparent outputs" },
                    { label: "Real-World Suitability", desc: "Only 8 inputs needed — practical for web users, not just clinicians" },
                  ].map(({ label, desc }) => (
                    <li key={label} className="flex gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-400" />
                      <div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why not others */}
              <div className="bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">❌</span>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Why not ANN or XGBoost</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Artificial Neural Network (94.27%)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Comparable accuracy but a "black box" — difficult to explain individual predictions. SHAP integration is complex. Heavier to deploy and less trustworthy in a healthcare context where clinicians need to understand decisions.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">XGBoost (92.27% on site features)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Initially considered in Phase 1, but performed 2.28% lower on the site feature set. While SHAP-compatible, it lacks the coefficient simplicity of Logistic Regression and adds unnecessary complexity for this task.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 italic">
                  "The best model is not the most complex one, but the most reliable and explainable."
                </p>
              </div>
            </div>

            {/* Decision timeline */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Decision Evolution</h3>
              <div className="flex items-center gap-0 overflow-x-auto">
                {[
                  { phase: "Phase 1", choice: "Logistic Regression", reason: "Strong performance + SHAP", color: "#f59e0b" },
                  { phase: "Phase 2", choice: "Logistic Regression", reason: "Highest accuracy on site features", color: "#10b981" },
                  { phase: "Final", choice: "Logistic Regression", reason: "Accuracy + interpretability + speed", color: "#2563eb" },
                ].map(({ phase, choice, reason, color }, i) => (
                  <div key={phase} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2"
                        style={{ background: color }}>
                        {i + 1}
                      </div>
                      <div className="text-center max-w-[120px]">
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">{phase}</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{choice}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{reason}</div>
                      </div>
                    </div>
                    {i < 2 && <div className="w-12 sm:w-20 h-px mx-2 flex-shrink-0 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ⑩  XAI ─────────────────────────────────── */}
          <section id="xai" ref={xaiRef}
            style={{
              opacity: xaiInView ? 1 : 0,
              transform: xaiInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Model Explainability</SectionLabel>
            <SectionTitle>Building trust through transparency</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  name: "SHAP", full: "SHapley Additive exPlanations", icon: "📊",
                  color: "#8b5cf6", bg: "bg-violet-50 dark:bg-violet-900/20",
                  border: "border-violet-100 dark:border-violet-900/40",
                  purpose: "Global feature importance shows which features drive predictions across the entire model.",
                  benefit: "Clinicians and users can see which health factors matter most, building systemic trust.",
                  badge: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400",
                },
                {
                  name: "LIME", full: "Local Interpretable Model-agnostic Explanations", icon: "🔍",
                  color: "#0ea5e9", bg: "bg-sky-50 dark:bg-sky-900/20",
                  border: "border-sky-100 dark:border-sky-900/40",
                  purpose: "Individual prediction explanation explains why a specific patient received their risk score.",
                  benefit: "Enables per-patient reasoning critical for healthcare where every case is unique.",
                  badge: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400",
                },
              ].map(({ name, full, icon, bg, border, purpose, benefit, badge }) => (
                <div key={name} className={`${bg} ${border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-white dark:bg-slate-800">{icon}</div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">{name}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{full}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                    <strong className="text-slate-800 dark:text-slate-200">Purpose:</strong> {purpose}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong className="text-slate-800 dark:text-slate-200">Benefit:</strong> {benefit}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badge}`}>
                      Applied to final model
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl text-sm bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300">
              <strong>Why this matters in healthcare:</strong> XAI methods "increase model transparency and the trust of end-users." In medical contexts, a prediction without explanation has limited clinical value doctors and patients need to understand <em>why</em> a risk level was assigned.
            </div>
          </section>

          {/* ⑪  SYSTEM DESIGN ────────────────────────── */}
          <section id="stack" ref={stackRef}
            style={{
              opacity: stackInView ? 1 : 0,
              transform: stackInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>System Design</SectionLabel>
            <SectionTitle>From model to production system</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {STACK.map(({ name, role, icon, color }) => (
                <div key={name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm flex items-start gap-3 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `${color}20` }}>
                    {icon}
                  </div>
                  <div>
                    <div className="font-display font-bold text-slate-900 dark:text-white text-sm">{name}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{role}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Flow */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Request Flow</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  { node: "User Input (8 features)", color: "#2563eb" },
                  { node: "React Frontend", color: "#06b6d4" },
                  { node: "FastAPI Backend", color: "#059669" },
                  { node: "Feature Scaling", color: "#f97316" },
                  { node: "LR Model (.pkl)", color: "#8b5cf6" },
                  { node: "SHAP Explanation", color: "#6366f1" },
                  { node: "Risk Result", color: "#10b981" },
                ].map(({ node, color }, i, arr) => (
                  <div key={node} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
                      {node}
                    </span>
                    {i < arr.length - 1 && <span className="text-slate-300 dark:text-slate-600">→</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ⑫  CONCLUSION ───────────────────────────── */}
          <section id="conclusion" ref={conclRef}
            style={{
              opacity: conclInView ? 1 : 0,
              transform: conclInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Conclusion</SectionLabel>
            <SectionTitle>From model building to system design</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: "🎯", title: "Accuracy vs Usability", desc: "A 0.54% accuracy trade-off enabled 8-feature usability — a clearly worthwhile engineering decision for a real-world web application." },
                { icon: "🔬", title: "Research Rigour", desc: "Validated dataset, leakage detection, 5-model comparison, and dual research phases demonstrate methodical ML engineering." },
                { icon: "🌍", title: "Real-World Focus", desc: "Every decision was driven by deployment needs speed, interpretability, user-friendliness not just benchmark performance." },
                { icon: "🏆", title: "Final Outcome", desc: "A robust, accurate, and explainable cardiovascular risk prediction system that is production-ready and clinically meaningful." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl mb-3">{icon}</div>
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="rounded-2xl p-8 text-center"
              style={{ background: "linear-gradient(135deg,#0f172a,#1e3a8a)" }}>
              <p className="text-blue-200/60 text-xs font-semibold uppercase tracking-widest mb-3">Try it yourself</p>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Run your own cardiovascular risk assessment
              </h3>
              <p className="text-blue-100/50 text-sm mb-6 max-w-sm mx-auto">
                The production system — built on this validated model — is live and free to use.
              </p>
              <button
                onClick={handleCTA}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)", boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}>
                {isLoggedIn ? "Go to Prediction →" : "Start Free Assessment →"}
              </button>
            </div>
          </section>

          {/* ⑬  RESOURCES ────────────────────────────── */}
          <section ref={resRef}
            style={{
              opacity: resInView ? 1 : 0,
              transform: resInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}>
            <SectionLabel>Resources & Reproducibility</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {RESOURCES.map(({ icon, label, sub, link }) => (
                <a key={label} href={link} target="_blank" rel="noopener noreferrer"
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
                  <span className="text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>
                  </div>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0 ml-auto transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-400">
                    <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 010-1.06L9.44 5.5H5.75a.75.75 0 010-1.5h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.56l-5.22 5.22a.75.75 0 01-1.06 0z" clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
