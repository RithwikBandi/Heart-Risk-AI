import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../CustomDropdown.jsx";
import { apiFetch } from "../api";

// Validation bounds (must match backend)
const LIMITS = {
  age: { min: 18, max: 85 },
  bmi: { min: 15, max: 45 },
  systolic_bp: { min: 90, max: 200 },
  cholesterol_mg_dl: { min: 120, max: 320 },
  physical_activity_hours_per_week: { min: 0, max: 14 },
  stress_level: { min: 1, max: 10 },
};

const SMOKING_OPTIONS = [
  { value: "", label: "Select status" },
  { value: "non_smoker", label: "Non-smoker" },
  { value: "former_smoker", label: "Former smoker" },
  { value: "current_smoker", label: "Current smoker" },
];

const FAMILY_HISTORY_OPTIONS = [
  { value: "", label: "Select option" },
  { value: "no", label: "No family history" },
  { value: "yes", label: "Yes, family history" },
];

function isNumeric(value) {
  if (value === "" || value === null || value === undefined) return false;
  const n = Number(value);
  return Number.isFinite(n);
}

function validateForm(formData) {
  const fieldErrors = {};

  if (!isNumeric(formData.age))
    fieldErrors.age = "Age is required.";
  else {
    const age = Number(formData.age);
    if (age < LIMITS.age.min || age > LIMITS.age.max)
      fieldErrors.age = `Age must be between ${LIMITS.age.min}–${LIMITS.age.max}.`;
  }

  if (!isNumeric(formData.bmi))
    fieldErrors.bmi = "BMI is required.";
  else {
    const bmi = Number(formData.bmi);
    if (bmi < LIMITS.bmi.min || bmi > LIMITS.bmi.max)
      fieldErrors.bmi = `BMI must be between ${LIMITS.bmi.min}–${LIMITS.bmi.max}.`;
  }

  if (!isNumeric(formData.systolic_bp))
    fieldErrors.systolic_bp = "Blood pressure is required.";
  else {
    const bp = Number(formData.systolic_bp);
    if (bp < LIMITS.systolic_bp.min || bp > LIMITS.systolic_bp.max)
      fieldErrors.systolic_bp = `BP must be between ${LIMITS.systolic_bp.min}–${LIMITS.systolic_bp.max} mmHg.`;
  }

  if (!isNumeric(formData.cholesterol_mg_dl))
    fieldErrors.cholesterol_mg_dl = "Cholesterol is required.";
  else {
    const chol = Number(formData.cholesterol_mg_dl);
    if (chol < LIMITS.cholesterol_mg_dl.min || chol > LIMITS.cholesterol_mg_dl.max)
      fieldErrors.cholesterol_mg_dl = `Cholesterol must be ${LIMITS.cholesterol_mg_dl.min}–${LIMITS.cholesterol_mg_dl.max} mg/dL.`;
  }

  if (formData.smoking_status === "")
    fieldErrors.smoking_status = "Please select smoking status.";
  else if (!["non_smoker", "former_smoker", "current_smoker"].includes(formData.smoking_status))
    fieldErrors.smoking_status = "Invalid smoking status.";

  if (formData.family_history_heart_disease === "")
    fieldErrors.family_history_heart_disease = "Please select an option.";
  else if (!["no", "yes"].includes(formData.family_history_heart_disease))
    fieldErrors.family_history_heart_disease = "Invalid option.";

  if (!isNumeric(formData.physical_activity_hours_per_week))
    fieldErrors.physical_activity_hours_per_week = "Physical activity is required.";
  else {
    const act = Number(formData.physical_activity_hours_per_week);
    if (act < LIMITS.physical_activity_hours_per_week.min || act > LIMITS.physical_activity_hours_per_week.max)
      fieldErrors.physical_activity_hours_per_week = `Must be between ${LIMITS.physical_activity_hours_per_week.min}–${LIMITS.physical_activity_hours_per_week.max} hrs/week.`;
  }

  if (!isNumeric(formData.stress_level))
    fieldErrors.stress_level = "Stress level is required.";
  else {
    const stress = Number(formData.stress_level);
    if (stress < LIMITS.stress_level.min || stress > LIMITS.stress_level.max)
      fieldErrors.stress_level = `Stress must be between ${LIMITS.stress_level.min}–${LIMITS.stress_level.max}.`;
  }

  return { valid: Object.keys(fieldErrors).length === 0, fieldErrors };
}

// ── Risk Gauge Component ────────────────────────────────────────────────────
function RiskGauge({ prediction }) {
  const p = (prediction || "").toLowerCase();
  const isLow = p.includes("low");
  const isMod = p.includes("moderate") || p.includes("medium");
  const isHigh = p.includes("high");

  const pct = isLow ? 20 : isMod ? 55 : isHigh ? 85 : 50;
  const color = isLow ? "#10b981" : isMod ? "#f59e0b" : isHigh ? "#ef4444" : "#6366f1";
  const bgColor = isLow ? "#d1fae5" : isMod ? "#fef3c7" : isHigh ? "#fee2e2" : "#e0e7ff";
  const label = isLow ? "Low Risk" : isMod ? "Moderate Risk" : isHigh ? "High Risk" : prediction;

  // Semicircle gauge
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = 180;
  const endAngle = 0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const circumference = Math.PI * radius;

  // Arc path for background
  const arcBg = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  // Needle angle: 180deg=0%, 0deg=100%
  const needleAngle = 180 - (pct / 100) * 180;
  const needleX = cx + (radius - 12) * Math.cos(toRad(needleAngle));
  const needleY = cy - (radius - 12) * Math.sin(toRad(needleAngle));

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-full max-w-[200px]" style={{ overflow: "visible" }}>
        {/* background arc */}
        <path d={arcBg} fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        {/* zones */}
        {[
          { from: 180, to: 120, color: "#10b981" },
          { from: 120, to: 60, color: "#f59e0b" },
          { from: 60, to: 0, color: "#ef4444" },
        ].map(({ from, to, color: c }, i) => {
          const fRad = toRad(from);
          const tRad = toRad(to);
          const x1 = cx + radius * Math.cos(fRad);
          const y1 = cy - radius * Math.sin(fRad);
          const x2 = cx + radius * Math.cos(tRad);
          const y2 = cy - radius * Math.sin(tRad);
          return (
            <path key={i}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
              fill="none" stroke={c} strokeWidth="16" strokeLinecap="butt" opacity="0.18"
            />
          );
        })}
        {/* active arc */}
        <path
          d={arcBg} fill="none"
          stroke={color} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct / 100)}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
            transformOrigin: "center",
          }}
        />
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: "all 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        {/* percentage */}
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="DM Sans, sans-serif">
          {pct}%
        </text>
      </svg>

      <div
        className="mt-2 px-5 py-2 rounded-xl text-sm font-bold tracking-wide"
        style={{ background: bgColor, color }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Result Card ─────────────────────────────────────────────────────────────
function ResultCard({ icon, title, items, delay = 0, accent = "#3b82f6" }) {
  if (!items || items.length === 0) return null;
  return (
    <div
      className="card p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" aria-hidden>{icon}</span>
        <h4 className="font-display font-semibold text-slate-800 text-sm">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-slate-600">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Input Field ─────────────────────────────────────────────────────────────
function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
            <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm-1-5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm1-7a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Slider Input ─────────────────────────────────────────────────────────────
function SliderInput({ id, name, value, min, max, step = 1, onChange, error, label, suffix = "" }) {
  const pct = Math.round(((value - min) / (max - min)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold text-blue-600 tabular-nums">
          {value || min}{suffix}
        </span>
      </div>
      <div className="relative">
        <input
          id={id} type="range" name={name}
          min={min} max={max} step={step}
          value={value === "" ? min : value}
          onChange={onChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function PredictionPage() {
  const [formData, setFormData] = useState({
    age: "",
    bmi: "",
    systolic_bp: "",
    cholesterol_mg_dl: "",
    smoking_status: "",
    family_history_heart_disease: "",
    physical_activity_hours_per_week: "",
    stress_level: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const value =
      e.target.type === "number" || e.target.type === "range"
        ? e.target.value === "" ? "" : Number(e.target.value)
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const { valid, fieldErrors: errors } = validateForm(formData);
    if (!valid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setResult(null);

    const payload = {
      age: Number(formData.age),
      bmi: Number(formData.bmi),
      systolic_bp: Number(formData.systolic_bp),
      cholesterol_mg_dl: Number(formData.cholesterol_mg_dl),
      smoking_status:
        formData.smoking_status === "non_smoker" ? 0
        : formData.smoking_status === "former_smoker" ? 1
        : formData.smoking_status === "current_smoker" ? 2 : null,
      family_history_heart_disease: formData.family_history_heart_disease === "yes" ? 1 : 0,
      physical_activity_hours_per_week: Number(formData.physical_activity_hours_per_week),
      stress_level: Number(formData.stress_level),
    };

    setLoading(true);
    try {
      const body = await apiFetch("/predict", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!body || typeof body.prediction !== "string") {
        setApiError("Invalid response from server. Please try again.");
        return;
      }
      setResult(body);
      // Scroll to result
      setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      if (err.name === "AbortError") setApiError("Request timed out. Please try again.");
      else if (err.message?.includes("fetch")) setApiError("Network error. Ensure the backend server is running.");
      else setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `input-field${fieldErrors[name] ? " error" : ""}`;

  const SectionHeader = ({ icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-5 pb-4 border-b border-slate-100">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "#eff6ff" }}>
        <span className="text-base" aria-hidden>{icon}</span>
      </div>
      <div>
        <h3 className="font-display font-semibold text-slate-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Risk Assessment</h1>
        <p className="text-slate-500 text-sm">
          Enter your clinical health data below. All fields are required for an accurate prediction.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {apiError && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-red-700 animate-scale-in"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {apiError}
          </div>
        )}

        {/* Section 1: Personal & Physical */}
        <div className="card p-6">
          <SectionHeader icon="👤" title="Personal & Physical" subtitle="Basic biometric measurements" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="age" label="Age" hint="18–85 years" error={fieldErrors.age}>
              <input id="age" type="number" name="age" placeholder="e.g. 45"
                value={formData.age === "" ? "" : formData.age}
                onChange={handleChange} className={inputClass("age")}
                aria-invalid={!!fieldErrors.age} />
            </Field>
            <Field id="bmi" label="BMI" hint="15–45" error={fieldErrors.bmi}>
              <input id="bmi" type="number" step="0.1" name="bmi" placeholder="e.g. 24.5"
                value={formData.bmi === "" ? "" : formData.bmi}
                onChange={handleChange} className={inputClass("bmi")}
                aria-invalid={!!fieldErrors.bmi} />
            </Field>
          </div>
        </div>

        {/* Section 2: Clinical Metrics */}
        <div className="card p-6">
          <SectionHeader icon="🩺" title="Clinical Metrics" subtitle="Cardiovascular biomarkers" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="systolic_bp" label="Systolic Blood Pressure" hint="mmHg · 90–200" error={fieldErrors.systolic_bp}>
              <input id="systolic_bp" type="number" name="systolic_bp" placeholder="e.g. 120"
                value={formData.systolic_bp === "" ? "" : formData.systolic_bp}
                onChange={handleChange} className={inputClass("systolic_bp")}
                aria-invalid={!!fieldErrors.systolic_bp} />
            </Field>
            <Field id="cholesterol_mg_dl" label="Cholesterol" hint="mg/dL · 120–320" error={fieldErrors.cholesterol_mg_dl}>
              <input id="cholesterol_mg_dl" type="number" name="cholesterol_mg_dl" placeholder="e.g. 180"
                value={formData.cholesterol_mg_dl === "" ? "" : formData.cholesterol_mg_dl}
                onChange={handleChange} className={inputClass("cholesterol_mg_dl")}
                aria-invalid={!!fieldErrors.cholesterol_mg_dl} />
            </Field>
          </div>
        </div>

        {/* Section 3: Lifestyle */}
        <div className="card p-6">
          <SectionHeader icon="🏃" title="Lifestyle Factors" subtitle="Habits that influence cardiovascular health" />
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <CustomDropdown
                  id="smoking_status" name="smoking_status"
                  label="Smoking Status"
                  value={formData.smoking_status}
                  onChange={handleChange}
                  options={SMOKING_OPTIONS}
                  placeholder="Select status"
                  error={fieldErrors.smoking_status}
                />
                {fieldErrors.smoking_status && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.smoking_status}</p>
                )}
              </div>
              <div>
                <CustomDropdown
                  id="family_history_heart_disease" name="family_history_heart_disease"
                  label="Family History of Heart Disease"
                  value={formData.family_history_heart_disease}
                  onChange={handleChange}
                  options={FAMILY_HISTORY_OPTIONS}
                  placeholder="Select option"
                  error={fieldErrors.family_history_heart_disease}
                />
                {fieldErrors.family_history_heart_disease && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.family_history_heart_disease}</p>
                )}
              </div>
            </div>

            <SliderInput
              id="physical_activity_hours_per_week"
              name="physical_activity_hours_per_week"
              label="Physical Activity"
              value={formData.physical_activity_hours_per_week}
              min={0} max={14} step={0.5}
              suffix=" hrs/week"
              onChange={handleChange}
              error={fieldErrors.physical_activity_hours_per_week}
            />

            <SliderInput
              id="stress_level"
              name="stress_level"
              label="Stress Level"
              value={formData.stress_level}
              min={1} max={10} step={1}
              suffix="/10"
              onChange={handleChange}
              error={fieldErrors.stress_level}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 text-base"
          style={{ borderRadius: "14px" }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Analyzing your health data…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
              </svg>
              Run Risk Assessment
            </span>
          )}
        </button>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded-lg skeleton" />
                <div className="h-3 w-1/4 rounded-lg skeleton" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded-lg skeleton" />
              <div className="h-3 w-4/5 rounded-lg skeleton" />
              <div className="h-3 w-3/5 rounded-lg skeleton" />
            </div>
          </div>
        </div>
      )}

      {/* Result section */}
      {result && !loading && (
        <section id="result-section" className="space-y-5 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <h2 className="font-display text-sm font-semibold text-slate-500 uppercase tracking-widest">
              Assessment Result
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Risk level card */}
          <div className="card p-6 animate-fade-up" style={{ animationDelay: "0ms" }}>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Cardiovascular Risk Classification
              </p>
              <RiskGauge prediction={result.prediction} />
              <p className="mt-4 text-xs text-slate-400 max-w-xs mx-auto">
                Based on your clinical inputs, the ML model has classified your cardiovascular risk level as shown above.
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard
              icon="⚠️"
              title="Key Risk Factors"
              items={result.key_factors}
              delay={100}
              accent="#ef4444"
            />
            <ResultCard
              icon="🛡️"
              title="Protective Factors"
              items={result.protective_factors}
              delay={150}
              accent="#10b981"
            />
            <ResultCard
              icon="🔬"
              title="Health Analysis"
              items={result.health_analysis}
              delay={200}
              accent="#6366f1"
            />
          </div>

          {/* Recommended actions */}
          {result.recommended_actions && result.recommended_actions.length > 0 && (
            <div className="card p-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📋</span>
                <h4 className="font-display font-semibold text-slate-800 text-sm">Recommended Actions</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommended_actions.map((action, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-xl text-sm text-slate-600"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", minWidth: "20px" }}>
                      {i + 1}
                    </span>
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs text-amber-800"
            style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <p>
              <strong>Medical Disclaimer:</strong> This ML assessment is for educational purposes only and does not replace professional medical advice. Always consult a qualified healthcare provider for medical decisions.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

export default PredictionPage;
