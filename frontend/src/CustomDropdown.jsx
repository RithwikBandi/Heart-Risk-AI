import { useState, useRef, useEffect } from "react";

/**
 * Reusable custom dropdown. Values are stored as provided (e.g. "non_smoker", "yes").
 * Parent is responsible for mapping to API format in submit handler.
 */
export default function CustomDropdown({
  id,
  name,
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  className = "",
  error = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }
    const idx = options.findIndex((opt) => opt.value === value);
    setHighlightedIndex(idx >= 0 ? idx : 0);
  }, [isOpen, value, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => (i < options.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : options.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          onChange({ target: { name, value: options[highlightedIndex].value } });
          setIsOpen(false);
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.value } });
    setIsOpen(false);
  };

  const borderColor = error ? "#ef4444" : isOpen ? "#3b82f6" : "var(--border-input)";
  const boxShadow = isOpen
    ? "0 0 0 3px rgba(59,130,246,0.12)"
    : error
    ? "0 0 0 3px rgba(239,68,68,0.1)"
    : "0 1px 3px rgba(15,23,42,0.04)";

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label
          htmlFor={id}
          className="form-label"
        >
          {label}
        </label>
      )}

      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full text-left transition-all duration-200 focus:outline-none flex items-center justify-between gap-2"
        style={{
          background: "var(--surface-input)",
          border: `1.5px solid ${borderColor}`,
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
          boxShadow,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.25s ease",
        }}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
      >
        <span>{displayLabel}</span>
        <span
          className="flex-shrink-0 transition-transform duration-200"
          style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-activedescendant={
            highlightedIndex >= 0 && options[highlightedIndex]
              ? `${id}-option-${highlightedIndex}`
              : undefined
          }
          className="absolute z-50 w-full mt-1.5 py-1.5 animate-dropdown origin-top"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {options.map((opt, i) => {
            const isSelected = value === opt.value;
            const isHighlighted = highlightedIndex === i;
            return (
              <li
                key={opt.value}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={isSelected}
                className="px-4 py-2.5 cursor-pointer text-sm transition-colors duration-100 flex items-center justify-between"
                style={{
                  background: isHighlighted ? "var(--bg-subtle)" : "transparent",
                  color: isSelected ? "#3b82f6" : "var(--text-primary)",
                  fontWeight: isSelected ? 600 : 400,
                  borderRadius: "8px",
                  margin: "0 4px",
                  padding: "10px 12px",
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
                onClick={() => handleSelect(opt)}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-blue-500">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
