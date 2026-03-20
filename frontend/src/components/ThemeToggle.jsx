/**
 * ThemeToggle — minimal sun/moon toggle button.
 * Accepts theme ("light"|"dark") and onToggle callback.
 * Variant: "light-bg" for use on light/glass navbars
 *          "dark-bg"  for use on dark hero backgrounds
 */
export default function ThemeToggle({ theme, onToggle, variant = "light-bg" }) {
  const isDark = theme === "dark";

  const baseClass =
    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none";

  const style =
    variant === "dark-bg"
      ? {
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#bfdbfe",
        }
      : {
          background: isDark ? "#1e293b" : "#f1f5f9",
          border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
          color: isDark ? "#94a3b8" : "#64748b",
        };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={baseClass}
      style={style}
    >
      {isDark ? (
        /* Sun icon */
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd" />
        </svg>
      ) : (
        /* Moon icon */
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}
