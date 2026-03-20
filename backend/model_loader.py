"""
Model loading and prediction. Feature order must match training.
Safe handling of inputs and SHAP failures.
"""
import math
import joblib
import shap
import os
import pandas as pd
import numpy as np


# ==========================================
# Locate Model Folder
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "model", "heart_risk_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "model", "scaler.pkl")


# ==========================================
# Feature Names (order must match training)
# ==========================================

feature_names = [
    "age",
    "bmi",
    "systolic_bp",
    "cholesterol_mg_dl",
    "smoking_status",
    "family_history_heart_disease",
    "physical_activity_hours_per_week",
    "stress_level",
]

# ==========================================
# Load Model and Scaler (fail fast on startup)
# ==========================================

_model = None
_scaler = None
_explainer = None


def _load_artifacts():
    global _model, _scaler, _explainer
    if _model is not None:
        return
    try:
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        background_data = np.zeros((1, len(feature_names)))
        _explainer = shap.Explainer(_model, background_data)
    except Exception as e:
        raise RuntimeError(f"Failed to load model or scaler: {e}") from e


def _to_numeric_safe(value):
    """Convert to float or int; return None if invalid (NaN, Inf, or non-numeric)."""
    if value is None:
        return None
    try:
        if isinstance(value, (int, float)) and not math.isfinite(value):
            return None
        f = float(value)
        if not math.isfinite(f):
            return None
        return f
    except (TypeError, ValueError):
        return None


def _prepare_feature_row(data):
    """
    Build a dict with exactly feature_names in order, all numeric and finite.
    Raises ValueError if any value is missing or invalid.
    """
    row = {}
    for k in feature_names:
        if k not in data:
            raise ValueError(f"Missing feature: {k}")
        v = data[k]
        if k in ("smoking_status", "family_history_heart_disease"):
            try:
                i = int(float(v))
                if not math.isfinite(float(v)):
                    raise ValueError(f"Invalid value for {k}")
                row[k] = i
            except (TypeError, ValueError):
                raise ValueError(f"Invalid or non-numeric value for {k}")
        else:
            n = _to_numeric_safe(v)
            if n is None:
                raise ValueError(f"Invalid or non-numeric value for {k}")
            row[k] = n
    return row


def predict(data):
    """
    Run model prediction and SHAP explanation. data must be a dict with
    all feature_names; values must be numeric and finite (validation layer
    should ensure this). Returns (prediction_class, shap_values, sample_df).
    """
    _load_artifacts()
    row = _prepare_feature_row(data)
    df = pd.DataFrame([row])
    df = df[feature_names]

    try:
        scaled = _scaler.transform(df)
    except Exception as e:
        raise RuntimeError(f"Scaler transform failed: {e}") from e

    try:
        prediction = _model.predict(scaled)
    except Exception as e:
        raise RuntimeError(f"Model prediction failed: {e}") from e

    if prediction is None or len(prediction) == 0:
        raise RuntimeError("Model returned no prediction.")

    pred_class = int(prediction[0])
    if pred_class not in (0, 1, 2):
        raise RuntimeError(f"Model returned invalid class: {pred_class}")

    try:
        shap_values = _explainer(scaled)
    except Exception:
        # Return prediction without SHAP; caller can use fallback explanation
        shap_values = None

    return pred_class, shap_values, df
