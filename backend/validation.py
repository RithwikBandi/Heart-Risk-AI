"""
Input validation for Heart Risk Prediction API.
Validates all fields against medically reasonable limits and rejects invalid payloads.
"""
import math
from typing import Tuple, Any, Optional

# Validation bounds (inclusive where applicable)
AGE_MIN, AGE_MAX = 18, 85
BMI_MIN, BMI_MAX = 15.0, 45.0
SYSTOLIC_BP_MIN, SYSTOLIC_BP_MAX = 90, 200
CHOLESTEROL_MIN, CHOLESTEROL_MAX = 120, 320
SMOKING_VALID = {0, 1, 2}
FAMILY_HISTORY_VALID = {0, 1}
PHYSICAL_ACTIVITY_MIN, PHYSICAL_ACTIVITY_MAX = 0.0, 14.0
STRESS_MIN, STRESS_MAX = 1, 10

REQUIRED_KEYS = [
    "age",
    "bmi",
    "systolic_bp",
    "cholesterol_mg_dl",
    "smoking_status",
    "family_history_heart_disease",
    "physical_activity_hours_per_week",
    "stress_level",
]


def _is_finite_number(x: Any) -> bool:
    """Return True if x is a finite number (no NaN, no Inf)."""
    if x is None:
        return False
    try:
        f = float(x)
        return math.isfinite(f)
    except (TypeError, ValueError):
        return False


def _to_int_safe(x: Any) -> Optional[int]:
    """Convert to int if possible and finite."""
    if x is None:
        return None
    try:
        i = int(float(x))
        return i if math.isfinite(float(x)) else None
    except (TypeError, ValueError):
        return None


def _to_float_safe(x: Any) -> Optional[float]:
    """Convert to float if possible and finite."""
    if x is None:
        return None
    try:
        f = float(x)
        return f if math.isfinite(f) else None
    except (TypeError, ValueError):
        return None


def validate_health_input(data: dict) -> Tuple[bool, Optional[str]]:
    """
    Validate request body for /predict. Returns (True, None) if valid,
    otherwise (False, "error message").
    """
    if not isinstance(data, dict):
        return False, "Invalid input: expected a JSON object."

    # Ensure all required keys present
    missing = [k for k in REQUIRED_KEYS if k not in data]
    if missing:
        return False, f"Invalid input: missing field(s): {', '.join(missing)}."

    # Age: 18–85
    age = _to_float_safe(data.get("age"))
    if age is None:
        return False, "Invalid input: age must be a valid number."
    if not (AGE_MIN <= age <= AGE_MAX):
        return False, f"Invalid input: age must be between {AGE_MIN} and {AGE_MAX}."

    # BMI: 15–45
    bmi = _to_float_safe(data.get("bmi"))
    if bmi is None:
        return False, "Invalid input: BMI must be a valid number."
    if not (BMI_MIN <= bmi <= BMI_MAX):
        return False, f"Invalid input: BMI must be between {BMI_MIN} and {BMI_MAX}."

    # Systolic BP: 90–200
    bp = _to_float_safe(data.get("systolic_bp"))
    if bp is None:
        return False, "Invalid input: systolic blood pressure must be a valid number."
    if not (SYSTOLIC_BP_MIN <= bp <= SYSTOLIC_BP_MAX):
        return False, f"Invalid input: systolic blood pressure must be between {SYSTOLIC_BP_MIN} and {SYSTOLIC_BP_MAX} mmHg."

    # Cholesterol: 120–320
    chol = _to_float_safe(data.get("cholesterol_mg_dl"))
    if chol is None:
        return False, "Invalid input: cholesterol must be a valid number."
    if not (CHOLESTEROL_MIN <= chol <= CHOLESTEROL_MAX):
        return False, f"Invalid input: cholesterol must be between {CHOLESTEROL_MIN} and {CHOLESTEROL_MAX} mg/dL."

    # Smoking: 0, 1, 2 only
    smoking = _to_int_safe(data.get("smoking_status"))
    if smoking is None:
        return False, "Invalid input: smoking status must be 0, 1, or 2."
    if smoking not in SMOKING_VALID:
        return False, "Invalid input: smoking status must be 0 (non-smoker), 1 (former), or 2 (current)."

    # Family history: 0 or 1 only
    fam = _to_int_safe(data.get("family_history_heart_disease"))
    if fam is None:
        return False, "Invalid input: family history must be 0 or 1."
    if fam not in FAMILY_HISTORY_VALID:
        return False, "Invalid input: family history must be 0 (no) or 1 (yes)."

    # Physical activity: 0–14 hours/week
    activity = _to_float_safe(data.get("physical_activity_hours_per_week"))
    if activity is None:
        return False, "Invalid input: physical activity must be a valid number."
    if not (PHYSICAL_ACTIVITY_MIN <= activity <= PHYSICAL_ACTIVITY_MAX):
        return False, f"Invalid input: physical activity must be between {PHYSICAL_ACTIVITY_MIN} and {PHYSICAL_ACTIVITY_MAX} hours per week."

    # Stress: 1–10
    stress = _to_float_safe(data.get("stress_level"))
    if stress is None:
        return False, "Invalid input: stress level must be a valid number."
    if not (STRESS_MIN <= stress <= STRESS_MAX):
        return False, f"Invalid input: stress level must be between {STRESS_MIN} and {STRESS_MAX}."

    return True, None


def sanitize_and_prepare_for_model(data: dict) -> Optional[dict]:
    """
    Return a dict with only required keys and numeric types, in fixed order.
    Returns None if any value is invalid (non-finite or out of range).
    """
    ok, err = validate_health_input(data)
    if not ok:
        return None

    return {
        "age": float(data["age"]),
        "bmi": float(data["bmi"]),
        "systolic_bp": float(data["systolic_bp"]),
        "cholesterol_mg_dl": float(data["cholesterol_mg_dl"]),
        "smoking_status": int(data["smoking_status"]),
        "family_history_heart_disease": int(data["family_history_heart_disease"]),
        "physical_activity_hours_per_week": float(data["physical_activity_hours_per_week"]),
        "stress_level": float(data["stress_level"]),
    }
