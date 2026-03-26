import { Link } from "react-router-dom";

const RESOURCES = [
  {
    section: "Dataset",
    items: [
      {
        icon: "🗃️",
        title: "Cardiovascular Risk Dataset",
        label: "Kaggle · 5,500 patient records",
        desc: "The curated dataset used for model training. Selected after evaluating multiple sources for data quality, completeness, and clinical relevance.",
        link: "https://www.kaggle.com/datasets/amirmahdiabbootalebi/heart-disease",
        linkLabel: "View on Kaggle",
        color: "#2563eb",
        bg: "#eff6ff",
      },
    ],
  },
  {
    section: "Data Validation",
    items: [
      {
        icon: "✅",
        title: "Dataset Validation Notebook",
        label: "Google Colab · Data Quality Report",
        desc: "Exploratory analysis, outlier detection, distribution checks, and feature correlation study before model training.",
        link: "https://colab.research.google.com/drive/1MnZ6Q-MATm9FymyJcDxrPxAnfgfAms5g",
        linkLabel: "Open in Colab",
        color: "#059669",
        bg: "#f0fdf4",
      },
    ],
  },
  {
    section: "Research Models",
    items: [
      {
        icon: "🔬",
        title: "Full Feature Research Model",
        label: "Google Colab · All Features",
        desc: "Comparison of Logistic Regression, Random Forest, Gradient Boosting, XGBoost, and ANN using the complete feature set.",
        link: "https://colab.research.google.com/drive/1PYu2eG6fNJm5SMuag7_3SZu1m1TWk-Uf",
        linkLabel: "Open in Colab",
        color: "#7c3aed",
        bg: "#f5f3ff",
      },
      {
        icon: "🎯",
        title: "Reduced Feature Research Model",
        label: "Google Colab · Site Features Only",
        desc: "Re-testing all models using only the 8 features selected for the web application. Logistic Regression achieved ~94.55% accuracy.",
        link: "https://colab.research.google.com/drive/1sDebUgeDYdjulMOru1E5dnuXFoeG9VRH",
        linkLabel: "Open in Colab",
        color: "#d97706",
        bg: "#fffbeb",
      },
    ],
  },
  {
    section: "Deployment Model",
    items: [
      {
        icon: "🚀",
        title: "Production Deployment Notebook",
        label: "Google Colab · Final Model",
        desc: "Final Logistic Regression model with feature scaling, SHAP explainability, and export of the .pkl files used in production.",
        link: "https://colab.research.google.com/drive/1m_ZXY22QOtGOLBPUjvNbqyAiqg2s9FII",
        linkLabel: "Open in Colab",
        color: "#0ea5e9",
        bg: "#f0f9ff",
      },
    ],
  },
];

const MODEL_COMPARISON = [
  { model: "Logistic Regression", accuracy: "95.09%", status: "selected", bar: 95 },
  { model: "Random Forest",       accuracy: "~91%",   status: "tested",   bar: 91 },
  { model: "Gradient Boosting",   accuracy: "~90%",   status: "tested",   bar: 90 },
  { model: "XGBoost",             accuracy: "~89%",   status: "tested",   bar: 89 },
  { model: "ANN",                 accuracy: "~88%",   status: "tested",   bar: 88 },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: "#f8fafc" }}>

      {/* Minimal top nav */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50"
        style={{ boxShadow: "0 1px 12px rgba(15,23,42,0.05)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <span className="font-display font-semibold text-slate-900 text-sm">CardioML</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">← Home</Link>
            <Link to="/register" className="btn-primary text-xs px-4 py-2" style={{ borderRadius: "8px" }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

        {/* Page hero */}
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
            📚 Research Transparency
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Project Resources
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
            Every dataset, notebook, and model used to build CardioML — fully open for review. Built with research rigour for academic and practical credibility.
          </p>
        </div>

        {/* Model comparison table */}
        <div className="card p-6 mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#eff6ff" }}>
              <span className="text-sm">🏆</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-sm">Model Comparison</h2>
              <p className="text-xs text-slate-400">5 algorithms tested · Logistic Regression selected</p>
            </div>
          </div>

          <div className="space-y-3">
            {MODEL_COMPARISON.map(({ model, accuracy, status, bar }) => (
              <div key={model} className="flex items-center gap-4">
                <div className="w-40 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{model}</span>
                    {status === "selected" && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "#d1fae5", color: "#065f46" }}>✓</span>
                    )}
                  </div>
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${bar}%`,
                      background: status === "selected"
                        ? "linear-gradient(90deg, #2563eb, #6366f1)"
                        : "#cbd5e1",
                    }}
                  />
                </div>
                <span className="w-16 text-right text-sm font-semibold"
                  style={{ color: status === "selected" ? "#2563eb" : "#94a3b8" }}>
                  {accuracy}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-slate-400 pt-4 border-t border-slate-100">
            Logistic Regression selected for deployment due to highest accuracy (~95.09%), strong interpretability, and simple production deployment.
          </p>
        </div>

        {/* Resource sections */}
        <div className="space-y-10">
          {RESOURCES.map(({ section, items }, si) => (
            <div key={section} className="animate-fade-up" style={{ animationDelay: `${(si + 2) * 80}ms` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ background: "#e2e8f0" }} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex-shrink-0">
                  {section}
                </h3>
                <div className="h-px flex-1" style={{ background: "#e2e8f0" }} />
              </div>

              <div className={`grid gap-4 ${items.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                {items.map(({ icon, title, label, desc, link, linkLabel, color, bg }) => (
                  <div key={title}
                    className="card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ background: bg }}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-slate-900 text-sm mb-0.5">{title}</h4>
                        <p className="text-xs font-medium" style={{ color }}>{label}</p>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">{desc}</p>
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group"
                      style={{ color }}>
                      {linkLabel}
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform">
                        <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 010-1.06L9.44 5.5H5.75a.75.75 0 010-1.5h5.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.56l-5.22 5.22a.75.75 0 01-1.06 0z" clipRule="evenodd"/>
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e3a8a)" }}>
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">Ready to try it?</p>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            Run your own cardiovascular risk assessment
          </h3>
          <p className="text-blue-100/60 text-sm mb-6">
            Built on the validated model. Free to use. Takes under 2 minutes.
          </p>
          <Link to="/register" className="btn-primary px-7 py-3 text-sm">
            Start Free Assessment →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            CardioML · Final Year Project · Rithwik (Ricky) · 2025
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
            <Link to="/login" className="hover:text-slate-700 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
